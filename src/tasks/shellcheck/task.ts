'use strict';

import path = require('path');
import taskLib = require('azure-pipelines-task-lib');
import installer = require('./installer');

const shellcheckExecutable = 'shellcheck';

const handleShellCheckScanFailure = () => {
    taskLib.setResult(taskLib.TaskResult.Failed, 'ShellCheck scan failed! Check the logs for violation details.');
};

const getToolRunner = (scriptFiles: string[]) => {
    let toolRunner = taskLib.tool(shellcheckExecutable);
    const rootDir = taskLib.cwd();
    const rootPrefix = path.normalize(`${rootDir}/`);

    scriptFiles.forEach(script => {
        toolRunner = toolRunner.arg(script.replace(rootPrefix, ''));
    });

    return toolRunner;
};

const runShellCheck = async (scriptFiles: string[]) => {
    if (!taskLib.which(shellcheckExecutable, false)) {
        taskLib.debug('ShellCheck not found. Installing now...');
        await installer.installShellCheck();
    }
    try {
        const shellCheckResult = await getToolRunner(scriptFiles).exec();
        if (shellCheckResult !== 0) {
            handleShellCheckScanFailure();
        }
    } catch (err) {
        handleShellCheckScanFailure();
    }
};

export const run = async () => {
    try {
        const targetFiles = taskLib.getInput('targetFiles', true);
        const scripts = taskLib.findMatch(null, targetFiles);
        if (scripts.length === 0) {
            return taskLib.warning(`No shell files found for input ${targetFiles}`);
        }
        await runShellCheck(scripts);
    } catch (err) {
        taskLib.setResult(taskLib.TaskResult.Failed, 'Fatal error. Enable debugging to see error details');
    }
};
