'use strict';

import chai = require('chai');
import Sinon = require('sinon');

import task = require('../../../../src/tasks/shellcheck/task');
import utils = require('../utils');

const assert = chai.assert;

suite('ShellCheck Ignored Error Codes Configuration', () => {
    let taskLibGetInputStub: Sinon.SinonStub;
    let getIgnoredErrorCodesInputStub: Sinon.SinonStub;
    let taskLibGetBoolInputStub: Sinon.SinonStub;
    let taskLibDebugStub: Sinon.SinonStub;
    let taskLibSetResultStub: Sinon.SinonStub;
    let toolRunnerArgStub: Sinon.SinonStub;
    let toolRunnerExecStub: Sinon.SinonStub;
    const failedResult = utils.failedResult;
    const succeededResult = utils.succeededResult;
    const shellCheckFailureMessage = utils.shellCheckTask.shellCheckFailureErrorMessage;
    const shellCheckSuccessMessage = utils.shellCheckTask.shellCheckSuccessMessage;
    let toolRunnerArgCallStartCount: number;
    const arg = '-e';
    const firstErrorCode = 'SC2059';
    const secondErrorCode = 'SC2011';
    const ignoredErrorCodes = [ firstErrorCode, secondErrorCode ];

    setup(() => {
        taskLibGetInputStub = utils.getTaskLibGetInputStub();
        taskLibGetBoolInputStub = utils.getTaskLibGetBoolInputStub();
        taskLibDebugStub = utils.getTaskLibDebugStub();
        taskLibSetResultStub = utils.getTaskLibSetResultStub();
        utils.shellCheckTask.stubs.getTaskLibGetOutputFormatInputStub(taskLibGetInputStub);
        utils.shellCheckTask.stubs.getTaskLibGetShellDialectInputStub(taskLibGetInputStub);
        utils.shellCheckTask.stubs.getTaskLibGetCheckSourcedFilesInputStub(taskLibGetBoolInputStub);
        utils.shellCheckTask.stubs.getTaskLibGetFollowSourcedFilesInputStub(taskLibGetBoolInputStub);
        getIgnoredErrorCodesInputStub = utils.shellCheckTask.stubs.getTaskLibGetIgnoredErrorCodesInputStub();
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
        toolRunnerArgCallStartCount = utils.shellCheckTask.inputs.matchedScriptFiles.length;
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
        const details = 'kaboom';
        toolRunnerExecStub.throws(() => new Error(details));
        await task.run();
        assert.isTrue(taskLibDebugStub.calledWithExactly(`Error details: ${details}`));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, shellCheckFailureMessage, true));
    });

    test('Should correctly handle scan failure with no error codes specified', async () => {
        getIgnoredErrorCodesInputStub.callsFake(() => []);
        toolRunnerExecStub.callsFake(() => 1);
        await task.run();
        assert.isFalse(toolRunnerArgStub.calledWith(arg));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, shellCheckFailureMessage, true));
    });

    test('Should correctly handle scan success with no error codes specified', async () => {
        getIgnoredErrorCodesInputStub.callsFake(() => []);
        toolRunnerExecStub.callsFake(() => 0);
        await task.run();
        assert.isFalse(toolRunnerArgStub.calledWith(arg));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(succeededResult, shellCheckSuccessMessage, true));
    });

    test('Should correctly handle scan failure with no error codes specified', async () => {
        getIgnoredErrorCodesInputStub.callsFake(() => []);
        toolRunnerExecStub.callsFake(() => 1);
        await task.run();
        assert.isFalse(toolRunnerArgStub.calledWith(arg));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, shellCheckFailureMessage, true));
    });

    test('Should correctly handle scan success with no error codes specified', async () => {
        getIgnoredErrorCodesInputStub.callsFake(() => []);
        toolRunnerExecStub.callsFake(() => 0);
        await task.run();
        assert.isFalse(toolRunnerArgStub.calledWith(arg));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(succeededResult, shellCheckSuccessMessage, true));
    });

    test('Should correctly handle scan failure with error codes specified', async () => {
        getIgnoredErrorCodesInputStub.callsFake(() => ignoredErrorCodes);
        toolRunnerExecStub.callsFake(() => 1);
        await task.run();
        assert.isTrue(toolRunnerArgStub.getCall(toolRunnerArgCallStartCount).calledWithExactly(arg));
        assert.isTrue(toolRunnerArgStub.getCall(++toolRunnerArgCallStartCount).calledWithExactly(firstErrorCode));
        assert.isTrue(toolRunnerArgStub.getCall(++toolRunnerArgCallStartCount).calledWithExactly(arg));
        assert.isTrue(toolRunnerArgStub.getCall(++toolRunnerArgCallStartCount).calledWithExactly(secondErrorCode));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, shellCheckFailureMessage, true));
    });

    test('Should correctly handle scan success with error codes specified', async () => {
        getIgnoredErrorCodesInputStub.callsFake(() => ignoredErrorCodes);
        toolRunnerExecStub.callsFake(() => 0);
        await task.run();
        assert.isTrue(toolRunnerArgStub.getCall(toolRunnerArgCallStartCount).calledWithExactly(arg));
        assert.isTrue(toolRunnerArgStub.getCall(++toolRunnerArgCallStartCount).calledWithExactly(firstErrorCode));
        assert.isTrue(toolRunnerArgStub.getCall(++toolRunnerArgCallStartCount).calledWithExactly(arg));
        assert.isTrue(toolRunnerArgStub.getCall(++toolRunnerArgCallStartCount).calledWithExactly(secondErrorCode));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(succeededResult, shellCheckSuccessMessage, true));
    });
});
