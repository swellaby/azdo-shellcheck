'use strict';

import chai = require('chai');
import Sinon = require('sinon');

import task = require('../../../../src/tasks/shellcheck/task');
import utils = require('../utils');

const assert = chai.assert;

suite('ShellCheck Task', () => {
    let taskLibGetInputStub: Sinon.SinonStub;
    let taskLibGetBoolInputStub: Sinon.SinonStub;
    let taskLibDebugStub: Sinon.SinonStub;
    let taskLibSetResultStub: Sinon.SinonStub;
    let taskLibGetOutputFormatInputStub: Sinon.SinonStub;
    let taskLibGetShellDialectInputStub: Sinon.SinonStub;
    let taskLibWarningStub: Sinon.SinonStub;
    const failedResult = utils.failedResult;

    setup(() => {
        taskLibGetInputStub = utils.getTaskLibGetInputStub();
        taskLibGetBoolInputStub = utils.getTaskLibGetBoolInputStub();
        taskLibDebugStub = utils.getTaskLibDebugStub();
        taskLibSetResultStub = utils.getTaskLibSetResultStub();
        taskLibWarningStub = utils.getTaskLibWarningStub();
        taskLibGetOutputFormatInputStub = utils.shellCheckTask.stubs.getTaskLibGetOutputFormatInputStub(taskLibGetInputStub);
        taskLibGetShellDialectInputStub = utils.shellCheckTask.stubs.getTaskLibGetShellDialectInputStub(taskLibGetInputStub);
        utils.shellCheckTask.stubs.getTaskLibGetCheckSourcedFilesInputStub(taskLibGetBoolInputStub);
        utils.shellCheckTask.stubs.getTaskLibGetFollowSourcedFilesInputStub(taskLibGetBoolInputStub);
        utils.shellCheckTask.stubs.getTaskLibGetIgnoredErrorCodesInputStub();
        utils.shellCheckTask.stubs.getTaskLibGetUseRcFilesInputStub(taskLibGetBoolInputStub);
        utils.shellCheckTask.stubs.getTaskLibGetTargetFilesInputInputStub(taskLibGetInputStub);
    });

    teardown(() => {
        Sinon.restore();
    });

    test('Should fail with correct error when fatal error thrown without details', async () => {
        taskLibGetOutputFormatInputStub.throws(() => new Error());
        await task.run();
        assert.isTrue(taskLibDebugStub.calledWithExactly('Error details: unknown'));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, utils.taskFatalErrorMessage));
    });

    test('Should fail with correct error when fatal error thrown with details', async () => {
        const details = 'ouch';
        taskLibGetOutputFormatInputStub.throws(() => new Error(details));
        await task.run();
        assert.isTrue(taskLibDebugStub.calledWithExactly(`Error details: ${details}`));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, utils.taskFatalErrorMessage));
    });

    test('Should fail with correct error when invalid OutputFormat specified', async () => {
        const format = 'XUnit';
        taskLibGetOutputFormatInputStub.callsFake(() => format);
        const expErrorMessage = utils.shellCheckTask.getInvalidOutputFormatErrorMessage(format);
        await task.run();
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, expErrorMessage, true));
    });

    test('Should fail with correct error when invalid ShellDialect specified', async () => {
        const dialect = 'daAsh';
        taskLibGetShellDialectInputStub.callsFake(() => dialect);
        const expErrorMessage = utils.shellCheckTask.getInvalidShellDialectErrorMessage(dialect);
        await task.run();
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, expErrorMessage, true));
    });

    test('Should fail with correct error when invalid ShellDialect specified', async () => {
        const dialect = 'daAsh';
        taskLibGetShellDialectInputStub.callsFake(() => dialect);
        const expErrorMessage = utils.shellCheckTask.getInvalidShellDialectErrorMessage(dialect);
        await task.run();
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, expErrorMessage, true));
    });

    test('Should return with warning when no matching files are found', async () => {
        utils.getTaskLibFindMatchStub().callsFake(() => []);
        await task.run();
        const expMessage = `No shell files found for input '${utils.shellCheckTask.inputs.targetFiles}'.`;
        assert.isTrue(taskLibWarningStub.calledWithExactly(expMessage));
    });

    test('Should fail with correct error when ShellCheck is not installed', async () => {
        utils.getTaskLibFindMatchStub();
        utils.getTaskLibWhichStub().callsFake(() => undefined);
        await task.run();
        const expMessage = 'ShellCheck executable not found. Add the ShellCheck Installer task to your pipeline, or manually install ShellCheck on your agent';
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, expMessage, true));
    });
});
