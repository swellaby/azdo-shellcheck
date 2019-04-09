'use strict';

import chai = require('chai');
import Sinon = require('sinon');

import ShellDialect = require('../../../../src/tasks/shellcheck/shell-dialect');
import task = require('../../../../src/tasks/shellcheck/task');
import utils = require('../../../utils');

const assert = chai.assert;

suite('ShellCheck Shell Dialect Configuration', () => {
    let taskLibGetInputStub: Sinon.SinonStub;
    let taskLibGetBoolInputStub: Sinon.SinonStub;
    let taskLibDebugStub: Sinon.SinonStub;
    let taskLibSetResultStub: Sinon.SinonStub;
    let taskLibGetShellDialectInputStub: Sinon.SinonStub;
    let toolRunnerArgStub: Sinon.SinonStub;
    let toolRunnerExecStub: Sinon.SinonStub;
    const failedResult = utils.failedResult;
    const succeededResult = utils.succeededResult;
    const shellCheckFailureMessage = utils.shellCheckTask.shellCheckFailureErrorMessage;
    const shellCheckSuccessMessage = utils.shellCheckTask.shellCheckSuccessMessage;
    let toolRunnerArgCallStartCount: number;
    const arg = '-s';

    setup(() => {
        taskLibGetInputStub = utils.getTaskLibGetInputStub();
        taskLibGetBoolInputStub = utils.getTaskLibGetBoolInputStub();
        taskLibDebugStub = utils.getTaskLibDebugStub();
        taskLibSetResultStub = utils.getTaskLibSetResultStub();
        utils.shellCheckTask.stubs.getTaskLibGetOutputFormatInputStub(taskLibGetInputStub);
        taskLibGetShellDialectInputStub = utils.shellCheckTask.stubs.getTaskLibGetShellDialectInputStub(taskLibGetInputStub);
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
        toolRunnerArgCallStartCount = utils.shellCheckTask.inputs.matchedScriptFiles.length + 2;
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

    test('Should correctly handle scan failure with bash dialect', async () => {
        const dialect = ShellDialect.bash;
        taskLibGetShellDialectInputStub.callsFake(() => dialect);
        toolRunnerExecStub.callsFake(() => 1);
        await task.run();
        assert.isTrue(toolRunnerArgStub.getCall(toolRunnerArgCallStartCount).calledWithExactly(arg));
        assert.isTrue(toolRunnerArgStub.getCall(++toolRunnerArgCallStartCount).calledWithExactly(dialect));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, shellCheckFailureMessage, true));
    });

    test('Should correctly handle scan success with bash dialect', async () => {
        const dialect = ShellDialect.bash;
        taskLibGetShellDialectInputStub.callsFake(() => dialect);
        toolRunnerExecStub.callsFake(() => 0);
        await task.run();
        assert.isTrue(toolRunnerArgStub.getCall(toolRunnerArgCallStartCount).calledWithExactly(arg));
        assert.isTrue(toolRunnerArgStub.getCall(++toolRunnerArgCallStartCount).calledWithExactly(dialect));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(succeededResult, shellCheckSuccessMessage, true));
    });

    test('Should correctly handle scan failure with bash dialect', async () => {
        const dialect = ShellDialect.dash;
        taskLibGetShellDialectInputStub.callsFake(() => dialect);
        toolRunnerExecStub.callsFake(() => 1);
        await task.run();
        assert.isTrue(toolRunnerArgStub.getCall(toolRunnerArgCallStartCount).calledWithExactly(arg));
        assert.isTrue(toolRunnerArgStub.getCall(++toolRunnerArgCallStartCount).calledWithExactly(dialect));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, shellCheckFailureMessage, true));
    });

    test('Should correctly handle scan success with dash dialect', async () => {
        const dialect = ShellDialect.dash;
        taskLibGetShellDialectInputStub.callsFake(() => dialect);
        toolRunnerExecStub.callsFake(() => 0);
        await task.run();
        assert.isTrue(toolRunnerArgStub.getCall(toolRunnerArgCallStartCount).calledWithExactly(arg));
        assert.isTrue(toolRunnerArgStub.getCall(++toolRunnerArgCallStartCount).calledWithExactly(dialect));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(succeededResult, shellCheckSuccessMessage, true));
    });

    test('Should correctly handle scan failure with ksh dialect', async () => {
        const dialect = ShellDialect.ksh;
        taskLibGetShellDialectInputStub.callsFake(() => dialect);
        toolRunnerExecStub.callsFake(() => 1);
        await task.run();
        assert.isTrue(toolRunnerArgStub.getCall(toolRunnerArgCallStartCount).calledWithExactly(arg));
        assert.isTrue(toolRunnerArgStub.getCall(++toolRunnerArgCallStartCount).calledWithExactly(dialect));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, shellCheckFailureMessage, true));
    });

    test('Should correctly handle scan success with ksh dialect', async () => {
        const dialect = ShellDialect.ksh;
        taskLibGetShellDialectInputStub.callsFake(() => dialect);
        toolRunnerExecStub.callsFake(() => 0);
        await task.run();
        assert.isTrue(toolRunnerArgStub.getCall(toolRunnerArgCallStartCount).calledWithExactly(arg));
        assert.isTrue(toolRunnerArgStub.getCall(++toolRunnerArgCallStartCount).calledWithExactly(dialect));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(succeededResult, shellCheckSuccessMessage, true));
    });

    test('Should correctly handle scan failure with sh dialect', async () => {
        const dialect = ShellDialect.sh;
        taskLibGetShellDialectInputStub.callsFake(() => dialect);
        toolRunnerExecStub.callsFake(() => 1);
        await task.run();
        assert.isTrue(toolRunnerArgStub.getCall(toolRunnerArgCallStartCount).calledWithExactly(arg));
        assert.isTrue(toolRunnerArgStub.getCall(++toolRunnerArgCallStartCount).calledWithExactly(dialect));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, shellCheckFailureMessage, true));
    });

    test('Should correctly handle scan success with sh dialect', async () => {
        const dialect = ShellDialect.sh;
        taskLibGetShellDialectInputStub.callsFake(() => dialect);
        toolRunnerExecStub.callsFake(() => 0);
        await task.run();
        assert.isTrue(toolRunnerArgStub.getCall(toolRunnerArgCallStartCount).calledWithExactly(arg));
        assert.isTrue(toolRunnerArgStub.getCall(++toolRunnerArgCallStartCount).calledWithExactly(dialect));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(succeededResult, shellCheckSuccessMessage, true));
    });

    test('Should correctly handle scan failure with default dialect', async () => {
        const dialect = ShellDialect.default;
        taskLibGetShellDialectInputStub.callsFake(() => dialect);
        toolRunnerExecStub.callsFake(() => 1);
        await task.run();
        assert.isFalse(toolRunnerArgStub.calledWith(arg));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, shellCheckFailureMessage, true));
    });

    test('Should correctly handle scan success with default dialect', async () => {
        const dialect = ShellDialect.default;
        taskLibGetShellDialectInputStub.callsFake(() => dialect);
        toolRunnerExecStub.callsFake(() => 0);
        await task.run();
        assert.isFalse(toolRunnerArgStub.calledWith(arg));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(succeededResult, shellCheckSuccessMessage, true));
    });
});
