'use strict';

import path = require('path');
import taskLib = require('azure-pipelines-task-lib');

import IInputs = require('./inputs');
import ShellDialect = require('./shell-dialect');

const handleShellCheckScanFailure = () => {
    taskLib.setResult(taskLib.TaskResult.Failed, 'ShellCheck scan failed! Check the logs for violation details.', true);
};

const getToolRunner = (inputs: IInputs) => {
    let toolRunner = taskLib.tool('shellcheck');
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

export const run = async (inputs: IInputs) => {
    try {
        if (!taskLib.which('shellcheck', false)) {
            const message = 'ShellCheck executable not found. Add the ShellCheck Installer task to your pipeline, or manually install ShellCheck on your agent';
            return taskLib.setResult(taskLib.TaskResult.Failed, message, true);
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
