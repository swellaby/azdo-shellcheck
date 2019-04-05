'use strict';

import chai = require('chai');
import Sinon = require('sinon');

import ShellCheckVersion = require('../../../../src/tasks/install/shellcheck-version');
import task = require('../../../../src/tasks/install/task');
import utils = require('../utils');

const assert = chai.assert;

suite('Install on Linux', () => {
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

    suite('version installation', () => {
        let pathJoinStub: Sinon.SinonStub;
        let taskLibGetVariableStub: Sinon.SinonStub;
        let taskLibMkdirPStub: Sinon.SinonStub;
        let osArchStub: Sinon.SinonStub;
        let toolLibPrependPathStub: Sinon.SinonStub;
        let toolLibDownloadStub: Sinon.SinonStub;
        let taskLibToolStub: Sinon.SinonStub;
        let toolRunnerArgStub: Sinon.SinonStub;
        let toolRunnerExecStub: Sinon.SinonStub;
        let binaryDirectoryName = '';
        const downloadDirectory = '/foo/bar';
        const tempDirectoryPath = '/vsts/work/_temp';
        let extractRoot = '';
        let binTargetDirectory = '';
        let expectedTarArgs = [];
        const shellCheckBinaryUrlBase = utils.shellCheckBinaryUrlBase;

        setup(() => {
            osTypeStub.callsFake(() => 'Linux');
            osArchStub = utils.getOsArchStub();
            pathJoinStub = utils.getPathJoinStub();
            taskLibGetVariableStub = utils.getTaskLibGetVariableStub();
            taskLibGetVariableStub.withArgs('Agent.TempDirectory').callsFake(() => tempDirectoryPath);
            taskLibMkdirPStub = utils.getTaskLibMkdirPStub();
            toolLibPrependPathStub = utils.getToolLibPrependPathStub();
            toolLibDownloadStub = utils.getToolLibDownloadStub();
            taskLibToolStub = utils.getTaskLibToolStub();
            toolRunnerArgStub = utils.getToolRunnerArgStub();
            toolRunnerExecStub = utils.getToolRunnerExecStub();
        });

        const setDynamicVariablesWithVersion = (version: string) => {
            binaryDirectoryName = `shellcheck-${version}`;
            extractRoot = `${tempDirectoryPath}/${binaryDirectoryName}`;
            binTargetDirectory = `${extractRoot}/${binaryDirectoryName}`;
            expectedTarArgs = [ 'xC', extractRoot, '-f', downloadDirectory ];
            toolLibDownloadStub.callsFake(() => Promise.resolve(downloadDirectory));
            pathJoinStub.withArgs(tempDirectoryPath, binaryDirectoryName).callsFake(() => extractRoot);
            pathJoinStub.withArgs(extractRoot, binaryDirectoryName).callsFake(() => binTargetDirectory);
        };

        const validate = (expectedDownloadUrl: string) => {
            assert.isTrue(toolLibDownloadStub.calledWithExactly(expectedDownloadUrl));
            assert.isTrue(taskLibGetVariableStub.calledWithExactly('Agent.TempDirectory'));
            assert.isTrue(taskLibMkdirPStub.calledOnceWithExactly(extractRoot));
            assert.isTrue(taskLibToolStub.calledOnceWithExactly('tar'));
            assert.isTrue(toolRunnerArgStub.calledOnceWithExactly(expectedTarArgs));
            assert.isTrue(toolRunnerExecStub.calledOnce);
            assert.isTrue(toolLibPrependPathStub.calledWithExactly(binTargetDirectory));
        };

        test('Should correctly install latest version on 64 bit architecture', async () => {
            const version = ShellCheckVersion.latest;
            taskLibGetVersionInputStub.callsFake(() => version);
            setDynamicVariablesWithVersion(version);
            osArchStub.callsFake(() => 'x64');
            const expectedDownloadUrl = `${shellCheckBinaryUrlBase}/shellcheck-${version}.linux.x86_64.tar.xz`;
            await task.run();
            validate(expectedDownloadUrl);
        });

        test('Should correctly install latest version on 64 bit ARM architecture', async () => {
            const version = ShellCheckVersion.latest;
            taskLibGetVersionInputStub.callsFake(() => version);
            setDynamicVariablesWithVersion(version);
            osArchStub.callsFake(() => 'arm64');
            const expectedDownloadUrl = `${shellCheckBinaryUrlBase}/shellcheck-${version}.linux.armv6hf.tar.xz`;
            await task.run();
            validate(expectedDownloadUrl);
        });

        test('Should correctly install stable version on 64 bit architecture', async () => {
            const version = ShellCheckVersion.stable;
            taskLibGetVersionInputStub.callsFake(() => version);
            setDynamicVariablesWithVersion(version);
            osArchStub.callsFake(() => 'x64');
            const expectedDownloadUrl = `${shellCheckBinaryUrlBase}/shellcheck-${version}.linux.x86_64.tar.xz`;
            await task.run();
            validate(expectedDownloadUrl);
        });

        test('Should correctly install stable version on 64 bit ARM architecture', async () => {
            const version = ShellCheckVersion.stable;
            taskLibGetVersionInputStub.callsFake(() => version);
            setDynamicVariablesWithVersion(version);
            osArchStub.callsFake(() => 'arm64');
            const expectedDownloadUrl = `${shellCheckBinaryUrlBase}/shellcheck-${version}.linux.armv6hf.tar.xz`;
            await task.run();
            validate(expectedDownloadUrl);
        });

        test('Should correctly install 0.6.0 version on 64 bit architecture', async () => {
            const versionKey = '0.6.0';
            const version = ShellCheckVersion[versionKey];
            taskLibGetVersionInputStub.callsFake(() => versionKey);
            setDynamicVariablesWithVersion(version);
            osArchStub.callsFake(() => 'x64');
            const expectedDownloadUrl = `${shellCheckBinaryUrlBase}/shellcheck-${version}.linux.x86_64.tar.xz`;
            await task.run();
            validate(expectedDownloadUrl);
        });

        test('Should correctly install 0.6.0 version on 64 bit ARM architecture', async () => {
            const versionKey = '0.6.0';
            const version = ShellCheckVersion[versionKey];
            taskLibGetVersionInputStub.callsFake(() => versionKey);
            setDynamicVariablesWithVersion(version);
            osArchStub.callsFake(() => 'arm64');
            const expectedDownloadUrl = `${shellCheckBinaryUrlBase}/shellcheck-${version}.linux.armv6hf.tar.xz`;
            await task.run();
            validate(expectedDownloadUrl);
        });

        test('Should correctly install 0.5.0 version on 64 bit architecture', async () => {
            const versionKey = '0.5.0';
            const version = ShellCheckVersion[versionKey];
            taskLibGetVersionInputStub.callsFake(() => versionKey);
            setDynamicVariablesWithVersion(version);
            osArchStub.callsFake(() => 'x64');
            const expectedDownloadUrl = `${shellCheckBinaryUrlBase}/shellcheck-${version}.linux.x86_64.tar.xz`;
            await task.run();
            validate(expectedDownloadUrl);
        });

        test('Should correctly install 0.5.0 version on 64 bit ARM architecture', async () => {
            const versionKey = '0.5.0';
            const version = ShellCheckVersion[versionKey];
            taskLibGetVersionInputStub.callsFake(() => versionKey);
            setDynamicVariablesWithVersion(version);
            osArchStub.callsFake(() => 'arm64');
            const expectedDownloadUrl = `${shellCheckBinaryUrlBase}/shellcheck-${version}.linux.armv6hf.tar.xz`;
            await task.run();
            validate(expectedDownloadUrl);
        });

        test('Should correctly install 0.4.7 version on 64 bit architecture', async () => {
            const versionKey = '0.4.7';
            const version = ShellCheckVersion[versionKey];
            taskLibGetVersionInputStub.callsFake(() => versionKey);
            setDynamicVariablesWithVersion(version);
            osArchStub.callsFake(() => 'x64');
            const expectedDownloadUrl = `${shellCheckBinaryUrlBase}/shellcheck-${version}.linux.x86_64.tar.xz`;
            await task.run();
            validate(expectedDownloadUrl);
        });

        test('Should correctly install 0.4.7 version on 64 bit ARM architecture', async () => {
            const versionKey = '0.4.7';
            const version = ShellCheckVersion[versionKey];
            taskLibGetVersionInputStub.callsFake(() => versionKey);
            setDynamicVariablesWithVersion(version);
            osArchStub.callsFake(() => 'arm64');
            const expectedDownloadUrl = `${shellCheckBinaryUrlBase}/shellcheck-${version}.linux.armv6hf.tar.xz`;
            await task.run();
            validate(expectedDownloadUrl);
        });

        test('Should correctly install 0.4.6 version on 64 bit architecture', async () => {
            const versionKey = '0.4.6';
            const version = ShellCheckVersion[versionKey];
            taskLibGetVersionInputStub.callsFake(() => versionKey);
            setDynamicVariablesWithVersion(version);
            osArchStub.callsFake(() => 'x64');
            const expectedDownloadUrl = `${shellCheckBinaryUrlBase}/shellcheck-${version}.linux.x86_64.tar.xz`;
            await task.run();
            validate(expectedDownloadUrl);
        });

        test('Should correctly install 0.4.6 version on 64 bit ARM architecture', async () => {
            const versionKey = '0.4.6';
            const version = ShellCheckVersion[versionKey];
            taskLibGetVersionInputStub.callsFake(() => versionKey);
            setDynamicVariablesWithVersion(version);
            osArchStub.callsFake(() => 'arm64');
            const expectedDownloadUrl = `${shellCheckBinaryUrlBase}/shellcheck-${version}.linux.armv6hf.tar.xz`;
            await task.run();
            validate(expectedDownloadUrl);
        });

        test('Should fail with correct error on unsupported architectures', async () => {
            const arch = 'x32';
            osArchStub.callsFake(() => arch);
            await task.run();
            assert.isTrue(taskLibDebugStub.calledWithExactly(`Error details: Unsupported architecture ${arch}`));
            assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, utils.taskFatalErrorMessage));
        });
    });
});
