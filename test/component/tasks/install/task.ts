'use strict';

import chai = require('chai');
import Sinon = require('sinon');

import ShellCheckVersion = require('../../../../src/tasks/install/shellcheck-version');
import task = require('../../../../src/tasks/install/task');
import utils = require('../../../utils');

const assert = chai.assert;

suite('Install Task', () => {
    let taskLibDebugStub: Sinon.SinonStub;
    let taskLibSetResultStub: Sinon.SinonStub;
    let taskLibGetVersionInputStub: Sinon.SinonStub;
    let osTypeStub: Sinon.SinonStub;
    const failedResult = utils.failedResult;

    setup(() => {
        taskLibDebugStub = utils.getTaskLibDebugStub();
        taskLibGetVersionInputStub = utils.getTaskLibGetVersionInputStub();
        taskLibGetVersionInputStub.callsFake(() => ShellCheckVersion.stable);
        taskLibSetResultStub = utils.getTaskLibSetResultStub();
        osTypeStub = utils.getOsTypeStub();
    });

    teardown(() => {
        Sinon.restore();
    });

    test('Should fail with correct error on invalid version input', async () => {
        const invalidVersion = 'foo';
        const expectedErrorMessage = utils.getInvalidVersionErrorMessage(invalidVersion);
        taskLibGetVersionInputStub.callsFake(() => invalidVersion);
        await task.run();
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, expectedErrorMessage, true));
    });

    test('Should fail with correct error when installer throws error without details', async () => {
        osTypeStub.throws(() => new Error());
        await task.run();
        assert.isTrue(taskLibDebugStub.calledWithExactly('Error details: unknown'));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, utils.taskFatalErrorMessage));
    });

    test('Should fail with correct error when installer throws error with details', async () => {
        const details = 'oh nose';
        osTypeStub.throws(() => new Error(details));
        await task.run();
        assert.isTrue(taskLibDebugStub.calledWithExactly(`Error details: ${details}`));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, utils.taskFatalErrorMessage));
    });

    test('Should fail with correct error on unsupported operating system', async () => {
        const os = 'MS-DOS';
        osTypeStub.callsFake(() => os);
        await task.run();
        assert.isTrue(taskLibDebugStub.calledWithExactly(`Error details: Unsupported Operating System: ${os.toLowerCase()}`));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, utils.taskFatalErrorMessage));
    });
});
