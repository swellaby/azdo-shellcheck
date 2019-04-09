'use strict';

import chai = require('chai');
import Sinon = require('sinon');

import task = require('../../../../src/tasks/shellcheck/task');
import utils = require('../../../utils');

const assert = chai.assert;

suite('ShellCheck Target Files Configuration', () => {
    let taskLibGetInputStub: Sinon.SinonStub;
    let taskLibGetBoolInputStub: Sinon.SinonStub;
    let taskLibDebugStub: Sinon.SinonStub;
    let taskLibSetResultStub: Sinon.SinonStub;
    let toolRunnerArgStub: Sinon.SinonStub;
    let toolRunnerExecStub: Sinon.SinonStub;
    const failedResult = utils.failedResult;
    const succeededResult = utils.succeededResult;
    const scriptFiles = utils.shellCheckTask.inputs.matchedScriptFiles;
    const shellCheckFailureMessage = utils.shellCheckTask.shellCheckFailureErrorMessage;

    setup(() => {
        taskLibGetInputStub = utils.getTaskLibGetInputStub();
        taskLibGetBoolInputStub = utils.getTaskLibGetBoolInputStub();
        taskLibDebugStub = utils.getTaskLibDebugStub();
        taskLibSetResultStub = utils.getTaskLibSetResultStub();
        utils.shellCheckTask.stubs.getTaskLibGetOutputFormatInputStub(taskLibGetInputStub);
        utils.shellCheckTask.stubs.getTaskLibGetShellDialectInputStub(taskLibGetInputStub);
        utils.shellCheckTask.stubs.getTaskLibGetCheckSourcedFilesInputStub(taskLibGetBoolInputStub);
        utils.shellCheckTask.stubs.getTaskLibGetFollowSourcedFilesInputStub(taskLibGetBoolInputStub);
        utils.shellCheckTask.stubs.getTaskLibGetIgnoredErrorCodesInputStub();
        utils.shellCheckTask.stubs.getTaskLibGetUseRcFilesInputStub(taskLibGetBoolInputStub);
        utils.shellCheckTask.stubs.getTaskLibGetTargetFilesInputInputStub(taskLibGetInputStub);
        utils.getTaskLibFindMatchStub();
        utils.getTaskLibWhichStub().callsFake(() => '/usr/bin/shellcheck');
        utils.getTaskLibCwdStub();
        utils.getPathNormalizeStub();
        utils.getTaskLibToolStub();
        toolRunnerArgStub = utils.getToolRunnerArgStub();
        utils.getToolRunnerArgIfStub();
        toolRunnerExecStub = utils.getToolRunnerExecStub();
    });

    teardown(() => {
        Sinon.restore();
    });

    test('Should fail with correct error when fatal error thrown by ShellCheck without details', async () => {
        toolRunnerExecStub.throws(() => new Error());
        await task.run();
        assert.isTrue(taskLibDebugStub.calledWithExactly('Error details: unknown'));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, shellCheckFailureMessage, true));
    });

    test('Should fail with correct error when fatal error thrown by ShellCheck without details', async () => {
        const details = 'boom';
        toolRunnerExecStub.throws(() => new Error(details));
        await task.run();
        assert.isTrue(taskLibDebugStub.calledWithExactly(`Error details: ${details}`));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, shellCheckFailureMessage, true));
    });

    test('Should correctly handle scan failure', async () => {
        toolRunnerExecStub.callsFake(() => 1);
        await task.run();
        assert.isTrue(toolRunnerArgStub.getCall(0).calledWithExactly(scriptFiles[0]));
        assert.isTrue(toolRunnerArgStub.getCall(1).calledWithExactly(scriptFiles[1]));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, shellCheckFailureMessage, true));
    });

    test('Should correctly handle scan success', async () => {
        toolRunnerExecStub.callsFake(() => 0);
        await task.run();
        assert.isTrue(toolRunnerArgStub.getCall(0).calledWithExactly(scriptFiles[0]));
        assert.isTrue(toolRunnerArgStub.getCall(1).calledWithExactly(scriptFiles[1]));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(succeededResult, utils.shellCheckTask.shellCheckSuccessMessage, true));
    });
});
