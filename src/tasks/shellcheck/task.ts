'use strict';

import taskLib = require('azure-pipelines-task-lib');

export const run = async () => {
    try {
        const format = taskLib.getInput('format', true);
        taskLib.debug(`Format: ${format}`);
    } catch (err) {
        taskLib.setResult(taskLib.TaskResult.Failed, 'crashed');
    }
};
