'use strict';

import taskLib = require('azure-pipelines-task-lib');

import IInputs = require('./inputs');
import OutputFormat = require('./output-format');
import shellCheck = require('./shellcheck');
import ShellDialect = require('./shell-dialect');

const failTask = (message: string, done: boolean) => {
    return taskLib.setResult(taskLib.TaskResult.Failed, message, done);
};

const getInputs = (outputFormat: OutputFormat, shellDialect: ShellDialect): IInputs => {
    const targetFiles = taskLib.getInput('targetFiles', true);
    const followSourcedFiles = taskLib.getBoolInput('followSourcedFiles', true);
    const checkSourcedFiles = taskLib.getBoolInput('checkSourcedFiles', true);
    const ignoredErrorCodes = taskLib.getDelimitedInput('ignoredErrorCodes', '\n', false);
    const useRcFiles = taskLib.getBoolInput('useRcFiles', true);
    const scriptFiles = taskLib.findMatch(null, targetFiles);

    return <IInputs>{
        scriptFiles,
        targetFiles,
        followSourcedFiles,
        checkSourcedFiles,
        ignoredErrorCodes,
        useRcFiles,
        outputFormat,
        shellDialect
    };
};

const getOutputFormat = (): OutputFormat => {
    const outputFormatInput = taskLib.getInput('outputFormat', true);
    const outputFormat: OutputFormat = OutputFormat[outputFormatInput];
    if (!outputFormat) {
        const errorMessage = `Invalid OutputFormat: '${outputFormatInput}'. Allowed values are: tty, checkstyle, gcc, json.`;
        failTask(errorMessage, true);
        return undefined;
    }

    return outputFormat;
};

const getShellDialect = (): ShellDialect => {
    const shellDialectInput = taskLib.getInput('shellDialect', true);
    const shellDialect: ShellDialect = ShellDialect[shellDialectInput];
    if (!shellDialect) {
        const errorMessage = `Invalid ShellDialect: '${shellDialectInput}'. Allowed values are: default, bash, dash, ksh, sh.`;
        failTask(errorMessage, true);
        return undefined;
    }
    return shellDialect;
};

export const run = async () => {
    try {
        const outputFormat = getOutputFormat();
        const shellDialect = getShellDialect();
        if (!outputFormat || !shellDialect) {
            return;
        }

        const inputs = getInputs(outputFormat, shellDialect);

        if (inputs.scriptFiles.length === 0) {
            return taskLib.warning(`No shell files found for input '${inputs.targetFiles}'.`);
        }

        await shellCheck.run(inputs);
    } catch (err) {
        taskLib.debug(`Error details: ${err && err.message ? err.message : 'unknown'}`);
        taskLib.setResult(taskLib.TaskResult.Failed, 'Fatal error. Enable debugging to see error details.');
    }
};
