'use strict';

import chai = require('chai');
import os = require('os');
import path = require('path');
import Sinon = require('sinon');
import taskLib = require('azure-pipelines-task-lib');
import toolLib = require('azure-pipelines-tool-lib');
import toolRunner = require('azure-pipelines-task-lib/toolrunner');

import installer = require('../../../../src/tasks/install/installer');
import ShellCheckVersion = require('../../../../src/tasks/install/shellcheck-version');

const assert = chai.assert;

suite('installers', () => {
    let osTypeStub: Sinon.SinonStub;
    let toolLibPrependPathStub: Sinon.SinonStub;
    let toolLibDownloadStub: Sinon.SinonStub;
    let taskLibToolStub: Sinon.SinonStub;
    let toolRunnerArgStub: Sinon.SinonStub;
    let toolRunnerExecStub: Sinon.SinonStub;

    const toolRunnerStub: toolRunner.ToolRunner = <toolRunner.ToolRunner> {
        arg: (_val) => null,
        exec: (_options) => null
    };
    const shellCheckBinaryUrlBase = 'https://shellcheck.storage.googleapis.com';

    setup(() => {
        osTypeStub = Sinon.stub(os, 'type');
        toolLibPrependPathStub = Sinon.stub(toolLib, 'prependPath');
        toolLibDownloadStub = Sinon.stub(toolLib, 'downloadTool');
        taskLibToolStub = Sinon.stub(taskLib, 'tool').callsFake(() => toolRunnerStub);
        toolRunnerArgStub = Sinon.stub(toolRunnerStub, 'arg').callsFake(() => toolRunnerStub);
        toolRunnerExecStub = Sinon.stub(toolRunnerStub, 'exec');
    });

    teardown(() => {
        Sinon.restore();
    });

    test('Should throw error on unsupported operating system', async () => {
        const operatingSystem = 'Scott-Tots';
        osTypeStub.callsFake(() => operatingSystem);
        const expErrorMessage = `Unsupported Operating System: ${operatingSystem.toLowerCase()}`;

        try {
            await installer.installShellCheck('latest');
            assert.isFalse(true);
        } catch (err) {
            assert.deepEqual(err.message, expErrorMessage);
        }
    });

    suite('Linux installer', () => {
        const version = '0.6.0';
        const binaryDirectoryName = `shellcheck-${version}`;
        const downloadDirectory = '/foo/bar';
        const tempDirectoryPath = '/vsts/work/_temp';
        const extractRoot = `${tempDirectoryPath}/${binaryDirectoryName}`;
        const binTargetDirectory = `${extractRoot}/${binaryDirectoryName}`;
        let osArchStub: Sinon.SinonStub;
        let pathJoinStub: Sinon.SinonStub;
        // let toolLibExtractTarStub: Sinon.SinonStub;
        let taskLibGetVariableStub: Sinon.SinonStub;
        let taskLibMkdirPStub: Sinon.SinonStub;
        const expectedTarArgs = [ 'xC', extractRoot, '-f', downloadDirectory ];

        setup(() => {
            osTypeStub.callsFake(() => 'linux');
            osArchStub = Sinon.stub(os, 'arch');
            pathJoinStub = Sinon.stub(path, 'join');
            pathJoinStub.withArgs(tempDirectoryPath, binaryDirectoryName).callsFake(() => extractRoot);
            pathJoinStub.withArgs(extractRoot, binaryDirectoryName).callsFake(() => binTargetDirectory);
            toolLibDownloadStub.callsFake(() => Promise.resolve(downloadDirectory));
            taskLibGetVariableStub = Sinon.stub(taskLib, 'getVariable');
            taskLibGetVariableStub.withArgs('Agent.TempDirectory').callsFake(() => tempDirectoryPath);
            taskLibMkdirPStub = Sinon.stub(taskLib, 'mkdirP');
            // toolLibExtractTarStub = Sinon.stub(toolLib, 'extractTar');
            // toolLibExtractTarStub.withArgs(downloadDirectory).callsFake(() => Promise.resolve(tempRoot));
        });

        test('Should throw error on unsupported architecture', async () => {
            const architecture = 's390x';
            osArchStub.callsFake(() => architecture);
            const expErrorMessage = `Unsupported architecture ${architecture}`;
            try {
                await installer.installShellCheck(version);
                assert.isFalse(true);
            } catch (err) {
                assert.deepEqual(err.message, expErrorMessage);
            }
        });

        test('Should install correctly on 64-bit architecture', async () => {
            osArchStub.callsFake(() => 'x64');
            const expectedDownloadUrl = `${shellCheckBinaryUrlBase}/shellcheck-${version}.linux.x86_64.tar.xz`;
            await installer.installShellCheck(version);
            assert.isTrue(toolLibDownloadStub.calledWithExactly(expectedDownloadUrl));
            assert.isTrue(taskLibGetVariableStub.calledWithExactly('Agent.TempDirectory'));
            assert.isTrue(taskLibMkdirPStub.calledOnceWithExactly(extractRoot));
            assert.isTrue(taskLibToolStub.calledOnceWithExactly('tar'));
            assert.isTrue(toolRunnerArgStub.calledOnceWithExactly(expectedTarArgs));
            assert.isTrue(toolRunnerExecStub.calledOnce);
            assert.isTrue(toolLibPrependPathStub.calledWithExactly(binTargetDirectory));
        });

        test('Should install correctly on arm 64-bit architecture', async () => {
            osArchStub.callsFake(() => 'arm64');
            const expectedDownloadUrl = `${shellCheckBinaryUrlBase}/shellcheck-${version}.linux.armv6hf.tar.xz`;
            await installer.installShellCheck(version);
            assert.isTrue(toolLibDownloadStub.calledWithExactly(expectedDownloadUrl));
            assert.isTrue(taskLibGetVariableStub.calledWithExactly('Agent.TempDirectory'));
            assert.isTrue(taskLibMkdirPStub.calledOnceWithExactly(extractRoot));
            assert.isTrue(taskLibToolStub.calledOnceWithExactly('tar'));
            assert.isTrue(toolRunnerArgStub.calledOnceWithExactly(expectedTarArgs));
            assert.isTrue(toolRunnerExecStub.calledOnce);
            assert.isTrue(toolLibPrependPathStub.calledWithExactly(binTargetDirectory));
        });

        test('Should bubble errors', async () => {
            const errMessage = 'crash';
            osArchStub.throws(new Error(errMessage));
            try {
                await installer.installShellCheck(version);
                assert.isFalse(true);
            } catch (err) {
                assert.deepEqual(err.message, errMessage);
            }
        });
    });

    suite('Mac installer', () => {
        let taskLibDebugStub: Sinon.SinonStub;
        const version = 'stable';
        const getVersionWarningMessage = (version) => `ShellCheck is installed with Homebrew on Mac. Cannot yet install custom version: ${version}`;

        setup(() => {
            osTypeStub.callsFake(() => 'darwin');
            taskLibDebugStub = Sinon.stub(taskLib, 'debug');
        });

        test('Should bubble errors', async () => {
            const errMessage = 'brew error';
            toolRunnerExecStub.throws(new Error(errMessage));
            try {
                await installer.installShellCheck(version);
                assert.isFalse(true);
            } catch (err) {
                assert.deepEqual(err.message, errMessage);
            }
        });

        test('Should install correctly with Homebrew', async () => {
            await installer.installShellCheck(version);
            assert.isTrue(taskLibToolStub.calledOnceWithExactly('brew'));
            assert.isTrue(toolRunnerArgStub.firstCall.calledWithExactly('install'));
            assert.isTrue(toolRunnerArgStub.secondCall.calledWithExactly('shellcheck'));
            assert.deepEqual(toolRunnerArgStub.callCount, 2);
            assert.deepEqual(toolRunnerExecStub.callCount, 1);
            assert.isTrue(toolRunnerExecStub.calledWithExactly(<toolRunner.IExecOptions>{ silent: true }));
        });

        test('Should not display warning for stable version', async () => {
            await installer.installShellCheck(ShellCheckVersion.stable);
            assert.isFalse(taskLibDebugStub.called);
        });

        test('Should display warning for latest version', async () => {
            const version = ShellCheckVersion.latest;
            await installer.installShellCheck(version);
            assert.isTrue(taskLibDebugStub.calledOnceWithExactly(getVersionWarningMessage(version)));
        });

        test('Should display warning for version 0.6.0', async () => {
            const version = ShellCheckVersion['0.6.0'];
            await installer.installShellCheck(version);
            assert.isTrue(taskLibDebugStub.calledOnceWithExactly(getVersionWarningMessage(version)));
        });

        test('Should display warning for version 0.5.0', async () => {
            const version = ShellCheckVersion['0.5.0'];
            await installer.installShellCheck(version);
            assert.isTrue(taskLibDebugStub.calledOnceWithExactly(getVersionWarningMessage(version)));
        });

        test('Should display warning for version 0.4.7', async () => {
            const version = ShellCheckVersion['0.4.7'];
            await installer.installShellCheck(version);
            assert.isTrue(taskLibDebugStub.calledOnceWithExactly(getVersionWarningMessage(version)));
        });

        test('Should display warning for version 0.4.6', async () => {
            const version = ShellCheckVersion['0.4.6'];
            await installer.installShellCheck(version);
            assert.isTrue(taskLibDebugStub.calledOnceWithExactly(getVersionWarningMessage(version)));
        });
    });

    suite('Windows installer', () => {
        const version = '0.5.0';
        const downloadFileName = `shellcheck-${version}.exe`;
        const shellcheckFileName = 'shellcheck.exe';
        const downloadDirectory = 'c:/users/me/temp';
        const downloadPath = `${downloadDirectory}/${shellcheckFileName}`;
        let pathParseStub: Sinon.SinonStub;

        setup(() => {
            osTypeStub.callsFake(() => 'Windows_NT');
            toolLibDownloadStub.callsFake(() => Promise.resolve(downloadPath));
            pathParseStub = Sinon.stub(path, 'parse');
            pathParseStub.withArgs(downloadPath).callsFake(() => ({ dir: downloadDirectory }));
        });

        test('Should install correctly', async () => {
            const expectedDownloadUrl = `${shellCheckBinaryUrlBase}/${downloadFileName}`;
            await installer.installShellCheck(version);
            assert.isTrue(toolLibDownloadStub.calledWithExactly(expectedDownloadUrl, shellcheckFileName));
            assert.isTrue(toolLibPrependPathStub.calledWithExactly(downloadDirectory));
        });

        test('Should bubble errors', async () => {
            const errMessage = 'blue screen error';
            toolLibDownloadStub.throws(new Error(errMessage));
            try {
                await installer.installShellCheck(version);
                assert.isFalse(true);
            } catch (err) {
                assert.deepEqual(err.message, errMessage);
            }
        });
    });
});
