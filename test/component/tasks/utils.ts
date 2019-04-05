'use strict';

import os = require('os');
import Sinon = require('sinon');
import taskLib = require('azure-pipelines-task-lib');

const getTaskLibGetInputStub = () => Sinon.stub(taskLib, 'getInput');
const getTaskLibSetResultStub = () => Sinon.stub(taskLib, 'setResult');
const getTaskLibDebugStub = () => Sinon.stub(taskLib, 'debug');
const getTaskLibGetVersionInputStub = (getInputStub?: Sinon.SinonStub) => {
    if (!getInputStub) {
        getInputStub = getTaskLibGetInputStub();
    }
    return getInputStub.withArgs('version').callsFake(() => '');
};
const getOsTypeStub = () => Sinon.stub(os, 'type').callsFake(() => '');
const getInvalidVersionErrorMessage = (version: string) => `Invalid Version: '${version}'. Allowed values are: latest, stable, 0.6.0, 0.5.0, 0.4.7, 0.4.6 .`;

const failedResult = taskLib.TaskResult.Failed;
const taskFatalErrorMessage = 'Fatal error. Enable debugging to see error details.';

export = {
    getTaskLibGetInputStub,
    getTaskLibSetResultStub,
    getTaskLibDebugStub,
    getTaskLibGetVersionInputStub,
    getOsTypeStub,
    getInvalidVersionErrorMessage,
    failedResult,
    taskFatalErrorMessage
};
