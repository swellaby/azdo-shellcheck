'use strict';

import os = require('os');
import path = require('path');
import Sinon = require('sinon');
import taskLib = require('azure-pipelines-task-lib');
import toolLib = require('azure-pipelines-tool-lib');
import toolRunner = require('azure-pipelines-task-lib/toolrunner');

const getTaskLibGetInputStub = () => Sinon.stub(taskLib, 'getInput');
const getTaskLibGetBoolInputStub = () => Sinon.stub(taskLib, 'getBoolInput');
const getTaskLibGetDelimitedInputStub = () => Sinon.stub(taskLib, 'getDelimitedInput');
const getTaskLibSetResultStub = () => Sinon.stub(taskLib, 'setResult');
const getTaskLibDebugStub = () => Sinon.stub(taskLib, 'debug');
const getTaskLibWarningStub = () => Sinon.stub(taskLib, 'warning');
const getTaskLibGetVersionInputStub = (getInputStub?: Sinon.SinonStub) => {
    if (!getInputStub) {
        getInputStub = getTaskLibGetInputStub();
    }
    return getInputStub.withArgs('version').callsFake(() => '');
};

const getTaskLibGetVariableStub = () => Sinon.stub(taskLib, 'getVariable');
const getTaskLibMkdirPStub = () => Sinon.stub(taskLib, 'mkdirP');
const getTaskLibWhichStub = () => Sinon.stub(taskLib, 'which');
const getTaskLibCwdStub = () => Sinon.stub(taskLib, 'cwd').callsFake(() => '/var/vsts');

const getOsTypeStub = () => Sinon.stub(os, 'type').callsFake(() => '');
const getOsArchStub = () => Sinon.stub(os, 'arch').callsFake(() => '');
const getPathJoinStub = () => Sinon.stub(path, 'join');
const getPathNormalizeStub = () => Sinon.stub(path, 'normalize').callsFake((p) => p);

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
const macInstallWarningMessageBase = 'ShellCheck is installed with Homebrew on Mac. Installing custom versions is not yet supported on Mac agents.';
const macInstallWarningMessageSuffix = `To get rid of this warning, change your target version to 'stable' or switch your pipeline to a different OS`;
const getMacInstallWarningMessage = (version: string) => `${macInstallWarningMessageBase} Unable to install custom version: ${version}. ${macInstallWarningMessageSuffix}`;

const failedResult = taskLib.TaskResult.Failed;
const succeededResult = taskLib.TaskResult.Succeeded;
const taskFatalErrorMessage = 'Fatal error. Enable debugging to see error details.';
const shellCheckBinaryUrlBase = 'https://shellcheck.storage.googleapis.com';
const targetFiles = '**/*sh';
const targetFilesInputKey = 'targetFiles';
const matchedScriptFiles = [ 'foo.sh', 'bar.sh' ];
const followSourcedFiles = false;
const followSourcedFilesInputKey = 'followSourcedFiles';
const checkSourcedFiles = false;
const checkSourcedFilesInputKey = 'checkSourcedFiles';
const ignoredErrorCodes = [];
const ignoredErrorCodesInputKey = 'ignoredErrorCodes';
const outputFormat = 'tty';
const outputFormatInputKey = 'outputFormat';
const shellDialect = 'default';
const shellDialectInputKey = 'shellDialect';
const useRcFiles = true;
const useRcFilesInputKey = 'useRcFiles';

const getTaskLibGetTargetFilesInputInputStub = (getInputStub?: Sinon.SinonStub) => {
    if (!getInputStub) {
        getInputStub = getTaskLibGetInputStub();
    }
    return getInputStub.withArgs(targetFilesInputKey).callsFake(() => targetFiles);
};

const getTaskLibGetFollowSourcedFilesInputStub = (getInputStub?: Sinon.SinonStub) => {
    if (!getInputStub) {
        getInputStub = getTaskLibGetBoolInputStub();
    }
    return getInputStub.withArgs(followSourcedFilesInputKey).callsFake(() => followSourcedFiles);
};

const getTaskLibGetCheckSourcedFilesInputStub = (getInputStub?: Sinon.SinonStub) => {
    if (!getInputStub) {
        getInputStub = getTaskLibGetBoolInputStub();
    }
    return getInputStub.withArgs(checkSourcedFilesInputKey).callsFake(() => checkSourcedFiles);
};

const getTaskLibGetIgnoredErrorCodesInputStub = (getInputStub?: Sinon.SinonStub) => {
    if (!getInputStub) {
        getInputStub = getTaskLibGetDelimitedInputStub();
    }
    return getInputStub.withArgs(ignoredErrorCodesInputKey).callsFake(() => ignoredErrorCodes);
};

const getTaskLibGetOutputFormatInputStub = (getInputStub?: Sinon.SinonStub) => {
    if (!getInputStub) {
        getInputStub = getTaskLibGetInputStub();
    }
    return getInputStub.withArgs(outputFormatInputKey).callsFake(() => outputFormat);
};

const getTaskLibGetShellDialectInputStub = (getInputStub?: Sinon.SinonStub) => {
    if (!getInputStub) {
        getInputStub = getTaskLibGetInputStub();
    }
    return getInputStub.withArgs(shellDialectInputKey).callsFake(() => shellDialect);
};

const getTaskLibGetUseRcFilesInputStub = (getInputStub?: Sinon.SinonStub) => {
    if (!getInputStub) {
        getInputStub = getTaskLibGetBoolInputStub();
    }
    return getInputStub.withArgs(useRcFilesInputKey).callsFake(() => useRcFiles);
};

const getTaskLibFindMatchStub = () => Sinon.stub(taskLib, 'findMatch').callsFake(() => matchedScriptFiles);
const shellCheckFailureErrorMessage = 'ShellCheck scan failed! Check the logs for violation details.';
const shellCheckSuccessMessage = 'ShellCheck scan succeeded!';

export = {
    shellCheckTask: {
        shellCheckFailureErrorMessage,
        shellCheckSuccessMessage,
        getInvalidOutputFormatErrorMessage: (format: string) => `Invalid OutputFormat: '${format}'. Allowed values are: tty, checkstyle, gcc, json.`,
        getInvalidShellDialectErrorMessage: (dialect: string ) => `Invalid ShellDialect: '${dialect}'. Allowed values are: default, bash, dash, ksh, sh.`,
        stubs: {
            getTaskLibGetTargetFilesInputInputStub,
            getTaskLibGetFollowSourcedFilesInputStub,
            getTaskLibGetCheckSourcedFilesInputStub,
            getTaskLibGetIgnoredErrorCodesInputStub,
            getTaskLibGetOutputFormatInputStub,
            getTaskLibGetShellDialectInputStub,
            getTaskLibGetUseRcFilesInputStub
        },
        inputs: {
            targetFiles,
            targetFilesInputKey,
            matchedScriptFiles,
            followSourcedFiles,
            followSourcedFilesInputKey,
            checkSourcedFiles,
            checkSourcedFilesInputKey,
            ignoredErrorCodes,
            ignoredErrorCodesInputKey,
            outputFormat,
            outputFormatInputKey,
            shellDialect,
            shellDialectInputKey,
            useRcFiles,
            useRcFilesInputKey
        }
    },
    getTaskLibGetInputStub,
    getTaskLibGetBoolInputStub,
    getTaskLibGetDelimitedInputStub,
    getTaskLibSetResultStub,
    getTaskLibDebugStub,
    getTaskLibWarningStub,
    getTaskLibGetVersionInputStub,
    getTaskLibGetVariableStub,
    getTaskLibMkdirPStub,
    getTaskLibWhichStub,
    getTaskLibToolStub,
    getTaskLibFindMatchStub,
    getTaskLibCwdStub,
    getOsTypeStub,
    getOsArchStub,
    getPathJoinStub,
    getPathNormalizeStub,
    toolRunnerStub,
    getToolRunnerArgStub,
    getToolRunnerArgIfStub,
    getToolRunnerExecStub,
    getToolLibPrependPathStub,
    getToolLibDownloadStub,
    getInvalidVersionErrorMessage,
    getMacInstallWarningMessage,
    failedResult,
    succeededResult,
    taskFatalErrorMessage,
    shellCheckBinaryUrlBase
};
