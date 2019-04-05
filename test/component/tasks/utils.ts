'use strict';

import os = require('os');
import path = require('path');
import Sinon = require('sinon');
import taskLib = require('azure-pipelines-task-lib');
import toolLib = require('azure-pipelines-tool-lib');
import toolRunner = require('azure-pipelines-task-lib/toolrunner');

const getTaskLibGetInputStub = () => Sinon.stub(taskLib, 'getInput');
const getTaskLibSetResultStub = () => Sinon.stub(taskLib, 'setResult');
const getTaskLibDebugStub = () => Sinon.stub(taskLib, 'debug');
const getTaskLibGetVersionInputStub = (getInputStub?: Sinon.SinonStub) => {
    if (!getInputStub) {
        getInputStub = getTaskLibGetInputStub();
    }
    return getInputStub.withArgs('version').callsFake(() => '');
};

const getTaskLibGetVariableStub = () => Sinon.stub(taskLib, 'getVariable');
const getTaskLibMkdirPStub = () => Sinon.stub(taskLib, 'mkdirP');

const getOsTypeStub = () => Sinon.stub(os, 'type').callsFake(() => '');
const getOsArchStub = () => Sinon.stub(os, 'arch').callsFake(() => '');
const getPathJoinStub = () => Sinon.stub(path, 'join');

const toolRunnerStub: toolRunner.ToolRunner = <toolRunner.ToolRunner> {
    arg: (_val) => null,
    argIf: (_condition, _val) => null,
    exec: (_options) => null
};

const getTaskLibToolStub = () => Sinon.stub(taskLib, 'tool').callsFake(() => toolRunnerStub);
const getToolRunnerArgStub = () => Sinon.stub(toolRunnerStub, 'arg').callsFake(() => toolRunnerStub);
const getToolRunnerArgIfStub = () => Sinon.stub(toolRunnerStub, 'argIf').callsFake(() => toolRunnerStub);
const getToolRunnerExecStub = () => Sinon.stub(toolRunnerStub, 'exec').callsFake(() => toolRunnerStub);
const getToolLibPrependPathStub = () => Sinon.stub(toolLib, 'prependPath');
const getToolLibDownloadStub = () => Sinon.stub(toolLib, 'downloadTool');

const getInvalidVersionErrorMessage = (version: string) => `Invalid Version: '${version}'. Allowed values are: latest, stable, 0.6.0, 0.5.0, 0.4.7, 0.4.6 .`;

const failedResult = taskLib.TaskResult.Failed;
const taskFatalErrorMessage = 'Fatal error. Enable debugging to see error details.';
const shellCheckBinaryUrlBase = 'https://shellcheck.storage.googleapis.com';

export = {
    getTaskLibGetInputStub,
    getTaskLibSetResultStub,
    getTaskLibDebugStub,
    getTaskLibGetVersionInputStub,
    getTaskLibGetVariableStub,
    getTaskLibMkdirPStub,
    getTaskLibToolStub,
    getOsTypeStub,
    getOsArchStub,
    getPathJoinStub,
    toolRunnerStub,
    getToolRunnerArgStub,
    getToolRunnerArgIfStub,
    getToolRunnerExecStub,
    getToolLibPrependPathStub,
    getToolLibDownloadStub,
    getInvalidVersionErrorMessage,
    failedResult,
    taskFatalErrorMessage,
    shellCheckBinaryUrlBase
};
