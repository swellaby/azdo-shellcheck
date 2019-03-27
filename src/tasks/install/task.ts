'use strict';

import taskLib = require('azure-pipelines-task-lib');
import installer = require('./installer');
import ShellCheckVersion = require('./shellcheck-version');

export const run = async () => {
    try {
        const versionInput = taskLib.getInput('version', true);
        const targetVersion = ShellCheckVersion[versionInput];
        if (!targetVersion) {
            const errorMessage = `Invalid Version: '${versionInput}'. Allowed values are: latest, stable, 0.6.0, 0.5.0, 0.4.7, 0.4.6 .`;
            return taskLib.setResult(taskLib.TaskResult.Failed, errorMessage, true);
        }

        await installer.installShellCheck(targetVersion);
    } catch (err) {
        taskLib.debug(`Error details: ${err && err.message ? err.message : 'unknown'}`);
        taskLib.setResult(taskLib.TaskResult.Failed, 'Fatal error. Enable debugging to see error details.');
    }
};
