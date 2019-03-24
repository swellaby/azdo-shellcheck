'use strict';

import path = require('path');
import taskLib = require('azure-pipelines-task-lib');

import installer = require('./installer');
import OutputFormat = require('./output-format');
import ShellDialect = require('./shell-dialect');

const shellcheckExecutable = 'shellcheck';

const handleShellCheckScanFailure = () => {
    taskLib.setResult(taskLib.TaskResult.Failed, 'ShellCheck scan failed! Check the logs for violation details.');
};

const getToolRunner = (
    scriptFiles: string[],
    followSourcedFiles: boolean,
    ignoredErrorCodes: string[],
    outputFormat: OutputFormat,
    shellDialect: ShellDialect,
    useRcFiles: boolean
) => {
    let toolRunner = taskLib.tool(shellcheckExecutable);
    const rootDir = taskLib.cwd();
    const rootPrefix = path.normalize(`${rootDir}/`);

    scriptFiles.forEach(script => {
        toolRunner = toolRunner.arg(script.replace(rootPrefix, ''));
    });

    toolRunner = toolRunner.argIf(followSourcedFiles, '-x');
    toolRunner = toolRunner.argIf(!useRcFiles, '--norc');

    ignoredErrorCodes.forEach(errorCode => {
        toolRunner = toolRunner.arg('-e').arg(errorCode);
    });

    toolRunner = toolRunner.arg('-f').arg(outputFormat);
    if (shellDialect !== ShellDialect.default) {
        toolRunner = toolRunner.arg('-s').arg(shellDialect);
    }

    return toolRunner;
};

const runShellCheck = async (
    scriptFiles: string[],
    followSourcedFiles: boolean,
    ignoredErrorCodes: string[],
    outputFormat: OutputFormat,
    shellDialect: ShellDialect,
    useRcFiles: boolean
) => {
    try {
        if (!taskLib.which(shellcheckExecutable, false)) {
            taskLib.debug('ShellCheck not found. Installing now...');
            await installer.installShellCheck();
        }

        const toolRunner = getToolRunner(scriptFiles, followSourcedFiles, ignoredErrorCodes, outputFormat, shellDialect, useRcFiles);
        const shellCheckResult = await toolRunner.exec();
        if (shellCheckResult !== 0) {
            return handleShellCheckScanFailure();
        }

        return taskLib.setResult(taskLib.TaskResult.Succeeded, 'ShellCheck scan succeeded!', true);
    } catch (err) {
        taskLib.debug(`Error details: ${err && err.message ? err.message : 'unknown'}`);
        handleShellCheckScanFailure();
    }
};

export const run = async () => {
    try {
        const targetFiles = taskLib.getInput('targetFiles', true);
        const followSourcedFiles = taskLib.getBoolInput('followSourcedFiles', true);
        const ignoredErrorCodes = taskLib.getDelimitedInput('ignoredErrorCodes', '\n', false);
        const outputFormat = OutputFormat[taskLib.getInput('outputFormat', true)];
        const shellDialect = ShellDialect[taskLib.getInput('shellDialect', true)];
        const useRcFiles = taskLib.getBoolInput('useRcFiles', true);
        const scripts = taskLib.findMatch(null, targetFiles);

        if (scripts.length === 0) {
            return taskLib.warning(`No shell files found for input '${targetFiles}'.`);
        }

        await runShellCheck(scripts, followSourcedFiles, ignoredErrorCodes, outputFormat, shellDialect, useRcFiles);
    } catch (err) {
        taskLib.setResult(taskLib.TaskResult.Failed, 'Fatal error. Enable debugging to see error details.');
    }
};
