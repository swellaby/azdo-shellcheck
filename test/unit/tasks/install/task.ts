'use strict';

import chai = require('chai');
import Sinon = require('sinon');
import taskLib = require('azure-pipelines-task-lib');

import installer = require('../../../../src/tasks/install/installer');
import ShellCheckVersion = require('../../../../src/tasks/install/shellcheck-version');
import task = require('../../../../src/tasks/install/task');

const assert = chai.assert;

suite('Install ShellCheck task', () => {
    let installerInstallShellCheckStub: Sinon.SinonStub;
    let taskLibDebugStub: Sinon.SinonStub;
    let taskLibGetInputStub: Sinon.SinonStub;
    let taskLibGetVersionInputStub: Sinon.SinonStub;
    let taskLibSetResultStub: Sinon.SinonStub;
    const failedResult = taskLib.TaskResult.Failed;
    const versionInputKey = 'version';
    const targetVersion = ShellCheckVersion.stable;

    setup(() => {
        installerInstallShellCheckStub = Sinon.stub(installer, 'installShellCheck');
        taskLibDebugStub = Sinon.stub(taskLib, 'debug');
        taskLibGetInputStub = Sinon.stub(taskLib, 'getInput');
        taskLibGetVersionInputStub = taskLibGetInputStub.withArgs(versionInputKey).callsFake(() => targetVersion);
        taskLibSetResultStub = Sinon.stub(taskLib, 'setResult');
    });

    teardown(() => {
        Sinon.restore();
    });

    suite('input config', () => {
        test('Should configure version input correctly', async () => {
            await task.run();
            assert.isTrue(taskLibGetInputStub.calledWithExactly(versionInputKey, true));
        });

        test('Should accept latest for version value', async () => {
            const version = ShellCheckVersion.latest;
            taskLibGetVersionInputStub.callsFake(() => version);
            await task.run();
            assert.isTrue(installerInstallShellCheckStub.calledWithExactly(version));
            assert.isFalse(taskLibSetResultStub.called);
        });

        test('Should accept stable for version value', async () => {
            const version = ShellCheckVersion.stable;
            taskLibGetVersionInputStub.callsFake(() => version);
            await task.run();
            assert.isTrue(installerInstallShellCheckStub.calledWithExactly(version));
            assert.isFalse(taskLibSetResultStub.called);
        });

        test('Should accept 0.6.0 for version value', async () => {
            const version = '0.6.0';
            taskLibGetVersionInputStub.callsFake(() => version);
            await task.run();
            assert.isTrue(installerInstallShellCheckStub.calledWithExactly(ShellCheckVersion[version]));
            assert.isFalse(taskLibSetResultStub.called);
        });

        test('Should accept 0.5.0 for version value', async () => {
            const version = '0.5.0';
            taskLibGetVersionInputStub.callsFake(() => version);
            await task.run();
            assert.isTrue(installerInstallShellCheckStub.calledWithExactly(ShellCheckVersion[version]));
            assert.isFalse(taskLibSetResultStub.called);
        });

        test('Should accept 0.4.7 for version value', async () => {
            const version = '0.4.7';
            taskLibGetVersionInputStub.callsFake(() => version);
            await task.run();
            assert.isTrue(installerInstallShellCheckStub.calledWithExactly(ShellCheckVersion[version]));
            assert.isFalse(taskLibSetResultStub.called);
        });

        test('Should accept 0.4.6 for version value', async () => {
            const version = '0.4.6';
            taskLibGetVersionInputStub.callsFake(() => version);
            await task.run();
            assert.isTrue(installerInstallShellCheckStub.calledWithExactly(ShellCheckVersion[version]));
            assert.isFalse(taskLibSetResultStub.called);
        });

        test('Should fail the task if an invalid version is specified', async () => {
            const version = '9.9.9';
            taskLibGetVersionInputStub.callsFake(() => version);
            await task.run();
            const message = `Invalid Version: '${version}'. Allowed values are: latest, stable, 0.6.0, 0.5.0, 0.4.7, 0.4.6 .`;
            assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, message, true));
            assert.isFalse(installerInstallShellCheckStub.called);
        });
    });

    suite('run', () => {
        const fatalErrorMessage = 'Fatal error. Enable debugging to see error details.';

        test('Should fail task with correct error message when error is thrown with no details', async () => {
            taskLibGetVersionInputStub.throws(() => new Error());
            await task.run();
            assert.isTrue(taskLibDebugStub.calledWithExactly('Error details: unknown'));
            assert.isTrue(taskLibSetResultStub.calledWith(failedResult, fatalErrorMessage));
        });

        test('Should fail task with correct error message when error is thrown with details', async () => {
            const errorMessage = 'winter has come';
            taskLibGetVersionInputStub.throws(() => new Error(errorMessage));
            await task.run();
            assert.isTrue(taskLibDebugStub.calledWithExactly(`Error details: ${errorMessage}`));
            assert.isTrue(taskLibSetResultStub.calledWith(failedResult, fatalErrorMessage));
        });

        test('Should handle any errors thrown by ShellCheck installer', async () => {
            installerInstallShellCheckStub.throws(() => new Error());
            await task.run();
            assert.isTrue(installerInstallShellCheckStub.called);
            assert.isTrue(taskLibSetResultStub.calledWith(failedResult, fatalErrorMessage));
        });

        test('Should pass correct version argument to installer', async () => {
            await task.run();
            assert.isTrue(installerInstallShellCheckStub.calledWithExactly(targetVersion));
        });
    });
});
