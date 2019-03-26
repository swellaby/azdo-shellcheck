'use strict';

import taskLib = require('azure-pipelines-task-lib');
import installer = require('./installer');
import ShellCheckVersion = require('./shellcheck-version');

export const run = async () => {
    try {
        const targetVersion = ShellCheckVersion[taskLib.getInput('version', true)];
        await installer.installShellCheck(targetVersion);
    } catch (err) {
        taskLib.setResult(taskLib.TaskResult.Failed, 'Fatal error. Enable debugging to see error details.');
    }
};
