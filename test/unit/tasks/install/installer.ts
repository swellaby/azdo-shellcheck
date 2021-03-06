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

    const shellCheckBinaryUrlBase = 'https://github.com/koalaman/shellcheck/releases/download';

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
        const version = 'v0.6.0';
        const binaryDirectoryName = `shellcheck-${version}`;
        const downloadDirectory = '/foo/bar';
        const tempDirectoryPath = '/vsts/work/_temp';
        const extractRoot = `${tempDirectoryPath}/${binaryDirectoryName}`;
        const binTargetDirectory = `${extractRoot}/${binaryDirectoryName}`;
        let osArchStub: Sinon.SinonStub;
        let pathJoinStub: Sinon.SinonStub;
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
            const expectedDownloadUrl = `${shellCheckBinaryUrlBase}/${version}/shellcheck-${version}.linux.x86_64.tar.xz`;
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
            const expectedDownloadUrl = `${shellCheckBinaryUrlBase}/${version}/shellcheck-${version}.linux.armv6hf.tar.xz`;
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
        let taskLibWarningStub: Sinon.SinonStub;
        const version = 'stable';
        const messageBase = 'ShellCheck is installed with Homebrew on Mac. Installing custom versions is not yet supported on Mac agents.';
        const messageSuffix = `To get rid of this warning, change your target version to 'stable' or switch your pipeline to a different OS`;
        const getVersionWarningMessage = (version: string) => `${messageBase} Unable to install custom version: ${version}. ${messageSuffix}`;

        setup(() => {
            osTypeStub.callsFake(() => 'darwin');
            taskLibWarningStub = Sinon.stub(taskLib, 'warning');
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
            assert.isFalse(taskLibWarningStub.called);
        });

        test('Should display warning for latest version', async () => {
            const version = ShellCheckVersion.latest;
            await installer.installShellCheck(version);
            assert.isTrue(taskLibWarningStub.calledOnceWithExactly(getVersionWarningMessage(version)));
        });

        test('Should display warning for version 0.6.0', async () => {
            const version = ShellCheckVersion['0.6.0'];
            await installer.installShellCheck(version);
            assert.isTrue(taskLibWarningStub.calledOnceWithExactly(getVersionWarningMessage(version)));
        });

        test('Should display warning for version 0.5.0', async () => {
            const version = ShellCheckVersion['0.5.0'];
            await installer.installShellCheck(version);
            assert.isTrue(taskLibWarningStub.calledOnceWithExactly(getVersionWarningMessage(version)));
        });

        test('Should display warning for version 0.4.7', async () => {
            const version = ShellCheckVersion['0.4.7'];
            await installer.installShellCheck(version);
            assert.isTrue(taskLibWarningStub.calledOnceWithExactly(getVersionWarningMessage(version)));
        });

        test('Should display warning for version 0.4.6', async () => {
            const version = ShellCheckVersion['0.4.6'];
            await installer.installShellCheck(version);
            assert.isTrue(taskLibWarningStub.calledOnceWithExactly(getVersionWarningMessage(version)));
        });
    });

    suite('Windows installer', () => {
        const version = 'v0.5.0';
        const downloadFileName = `shellcheck-${version}.zip`;
        const downloadDirectory = 'c:/users/me/temp';
        const downloadPath = `${downloadDirectory}/${downloadFileName}`;
        const extractionDirectory = `c:/agent/_work/tool/shellcheck/${version}`;
        let taskLibMvStub: Sinon.SinonStub;
        let toolLibExtractZipStub: Sinon.SinonStub;

        setup(() => {
            osTypeStub.callsFake(() => 'Windows_NT');
            toolLibDownloadStub.callsFake(() => Promise.resolve(downloadPath));
            toolLibExtractZipStub = Sinon.stub(toolLib, 'extractZip');
            toolLibExtractZipStub.withArgs(downloadPath).callsFake(() => Promise.resolve(extractionDirectory));
            taskLibMvStub = Sinon.stub(taskLib, 'mv');
        });

        test('Should install correctly', async () => {
            const expectedDownloadUrl = `${shellCheckBinaryUrlBase}/${version}/${downloadFileName}`;
            await installer.installShellCheck(version);
            assert.isTrue(toolLibDownloadStub.calledWithExactly(expectedDownloadUrl, downloadFileName));
            assert.isTrue(toolLibPrependPathStub.calledWithExactly(extractionDirectory));
            assert.isTrue(taskLibMvStub.calledWithExactly(
                `${extractionDirectory}/shellcheck-${version}.exe`,
                `${extractionDirectory}/shellcheck.exe`
            ));
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
