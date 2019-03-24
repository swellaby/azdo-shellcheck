'use strict';

import path = require('path');
import taskLib = require('azure-pipelines-task-lib');

import IInputs = require('./inputs');
import installer = require('./installer');
import OutputFormat = require('./output-format');
import ShellDialect = require('./shell-dialect');

const shellcheckExecutable = 'shellcheck';

const handleShellCheckScanFailure = () => {
    taskLib.setResult(taskLib.TaskResult.Failed, 'ShellCheck scan failed! Check the logs for violation details.');
};

const getToolRunner = (inputs: IInputs) => {
    let toolRunner = taskLib.tool(shellcheckExecutable);
    const rootDir = taskLib.cwd();
    const rootPrefix = path.normalize(`${rootDir}/`);

    inputs.scriptFiles.forEach(script => {
        toolRunner = toolRunner.arg(script.replace(rootPrefix, ''));
    });

    toolRunner = toolRunner.argIf(inputs.followSourcedFiles, '-x');
    toolRunner = toolRunner.argIf(inputs.checkSourcedFiles, '-a');
    toolRunner = toolRunner.argIf(!inputs.useRcFiles, '--norc');

    inputs.ignoredErrorCodes.forEach(errorCode => {
        toolRunner = toolRunner.arg('-e').arg(errorCode);
    });

    toolRunner = toolRunner.arg('-f').arg(inputs.outputFormat);
    if (inputs.shellDialect !== ShellDialect.default) {
        toolRunner = toolRunner.arg('-s').arg(inputs.shellDialect);
    }

    return toolRunner;
};

const runShellCheck = async (inputs: IInputs) => {
    try {
        if (!taskLib.which(shellcheckExecutable, false)) {
            taskLib.debug('ShellCheck not found. Installing now...');
            await installer.installShellCheck();
        }

        const shellCheckResult = await getToolRunner(inputs).exec();
        if (shellCheckResult !== 0) {
            return handleShellCheckScanFailure();
        }

        return taskLib.setResult(taskLib.TaskResult.Succeeded, 'ShellCheck scan succeeded!', true);
    } catch (err) {
        taskLib.debug(`Error details: ${err && err.message ? err.message : 'unknown'}`);
        handleShellCheckScanFailure();
    }
};

const getInputs = (): IInputs => {
    const targetFiles = taskLib.getInput('targetFiles', true);
    const followSourcedFiles = taskLib.getBoolInput('followSourcedFiles', true);
    const checkSourcedFiles = taskLib.getBoolInput('checkSourcedFiles', true);
    const ignoredErrorCodes = taskLib.getDelimitedInput('ignoredErrorCodes', '\n', false);
    const outputFormat = OutputFormat[taskLib.getInput('outputFormat', true)];
    const shellDialect = ShellDialect[taskLib.getInput('shellDialect', true)];
    const useRcFiles = taskLib.getBoolInput('useRcFiles', true);
    const scriptFiles = taskLib.findMatch(null, targetFiles);

    return <IInputs>{
        scriptFiles,
        targetFiles,
        followSourcedFiles,
        checkSourcedFiles,
        ignoredErrorCodes,
        outputFormat,
        shellDialect,
        useRcFiles
    };
};

export const run = async () => {
    try {
        const inputs = getInputs();

        if (inputs.scriptFiles.length === 0) {
            return taskLib.warning(`No shell files found for input '${inputs.targetFiles}'.`);
        }

        await runShellCheck(inputs);
    } catch (err) {
        taskLib.setResult(taskLib.TaskResult.Failed, 'Fatal error. Enable debugging to see error details.');
    }
};
