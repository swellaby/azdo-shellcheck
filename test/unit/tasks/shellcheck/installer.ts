// 'use strict';

// import chai = require('chai');
// import os = require('os');
// import path = require('path');
// import Sinon = require('sinon');
// import taskLib = require('azure-pipelines-task-lib');
// import toolLib = require('azure-pipelines-tool-lib');
// import toolRunner = require('azure-pipelines-task-lib/toolrunner');

// import installer = require('../../../../src/tasks/shellcheck/installer');

// const assert = chai.assert;

// suite('installers', () => {
//     let osTypeStub: Sinon.SinonStub;
//     let toolLibPrependPathStub: Sinon.SinonStub;
//     let toolLibDownloadStub: Sinon.SinonStub;
//     const shellCheckBinaryUrlBase = 'https://shellcheck.storage.googleapis.com';

//     setup(() => {
//         osTypeStub = Sinon.stub(os, 'type');
//         toolLibPrependPathStub = Sinon.stub(toolLib, 'prependPath');
//         toolLibDownloadStub = Sinon.stub(toolLib, 'downloadTool');
//     });

//     teardown(() => {
//         Sinon.restore();
//     });

//     test('Should throw error on unsupported operating system', async () => {
//         const operatingSystem = 'Scott-Tots';
//         osTypeStub.callsFake(() => operatingSystem);
//         const expErrorMessage = `Unsupported Operating System: ${operatingSystem.toLowerCase()}`;

//         try {
//             await installer.installShellCheck();
//             assert.isFalse(true);
//         } catch (err) {
//             assert.deepEqual(err.message, expErrorMessage);
//         }
//     });

//     suite('Linux installer', () => {
//         const binaryDirectoryName = 'shellcheck-latest';
//         const downloadDirectory = '/foo/bar';
//         const tempRoot = '/tmp';
//         const binaryLocation = `${tempRoot}/${binaryDirectoryName}`;
//         let osArchStub: Sinon.SinonStub;
//         let pathJoinStub: Sinon.SinonStub;
//         let toolLibExtractTarStub: Sinon.SinonStub;

//         setup(() => {
//             osTypeStub.callsFake(() => 'linux');
//             osArchStub = Sinon.stub(os, 'arch');
//             pathJoinStub = Sinon.stub(path, 'join');
//             pathJoinStub.withArgs(tempRoot, binaryDirectoryName).callsFake(() => binaryLocation);
//             toolLibDownloadStub.callsFake(() => Promise.resolve(downloadDirectory));
//             toolLibExtractTarStub = Sinon.stub(toolLib, 'extractTar');
//             toolLibExtractTarStub.withArgs(downloadDirectory).callsFake(() => Promise.resolve(tempRoot));
//         });

//         test('Should throw error on unsupported architecture', async () => {
//             const architecture = 's390x';
//             osArchStub.callsFake(() => architecture);
//             const expErrorMessage = `Unsupported architecture ${architecture}`;
//             try {
//                 await installer.installShellCheck();
//                 assert.isFalse(true);
//             } catch (err) {
//                 assert.deepEqual(err.message, expErrorMessage);
//             }
//         });

//         test('Should install correctly on 64-bit architecture', async () => {
//             osArchStub.callsFake(() => 'x64');
//             const expectedDownloadUrl = `${shellCheckBinaryUrlBase}/shellcheck-latest.linux.x86_64.tar.xz`;
//             await installer.installShellCheck();
//             assert.isTrue(toolLibDownloadStub.calledWithExactly(expectedDownloadUrl));
//             assert.isTrue(toolLibPrependPathStub.calledWithExactly(binaryLocation));
//         });

//         test('Should install correctly on arm 64-bit architecture', async () => {
//             osArchStub.callsFake(() => 'arm64');
//             const expectedDownloadUrl = `${shellCheckBinaryUrlBase}/shellcheck-latest.linux.armv6hf.tar.xz`;
//             await installer.installShellCheck();
//             assert.isTrue(toolLibDownloadStub.calledWithExactly(expectedDownloadUrl));
//             assert.isTrue(toolLibPrependPathStub.calledWithExactly(binaryLocation));
//         });

//         test('Should bubble errors', async () => {
//             const errMessage = 'crash';
//             osArchStub.throws(new Error(errMessage));
//             try {
//                 await installer.installShellCheck();
//                 assert.isFalse(true);
//             } catch (err) {
//                 assert.deepEqual(err.message, errMessage);
//             }
//         });
//     });

//     suite('Mac installer', () => {
//         let taskLibToolStub: Sinon.SinonStub;
//         let toolRunnerArgStub: Sinon.SinonStub;
//         let toolRunnerExecStub: Sinon.SinonStub;

//         const toolRunnerStub: toolRunner.ToolRunner = <toolRunner.ToolRunner> {
//             arg: (_val) => null,
//             exec: (_options) => null
//         };

//         setup(() => {
//             osTypeStub.callsFake(() => 'darwin');
//             taskLibToolStub = Sinon.stub(taskLib, 'tool').callsFake(() => toolRunnerStub);
//             toolRunnerArgStub = Sinon.stub(toolRunnerStub, 'arg').callsFake(() => toolRunnerStub);
//             toolRunnerExecStub = Sinon.stub(toolRunnerStub, 'exec');
//         });

//         test('Should bubble errors', async () => {
//             const errMessage = 'brew error';
//             toolRunnerExecStub.throws(new Error(errMessage));
//             try {
//                 await installer.installShellCheck();
//                 assert.isFalse(true);
//             } catch (err) {
//                 assert.deepEqual(err.message, errMessage);
//             }
//         });

//         test('Should install correctly with Homebrew', async () => {
//             await installer.installShellCheck();
//             assert.isTrue(taskLibToolStub.calledOnceWithExactly('brew'));
//             assert.isTrue(toolRunnerArgStub.firstCall.calledWithExactly('install'));
//             assert.isTrue(toolRunnerArgStub.secondCall.calledWithExactly('shellcheck'));
//             assert.deepEqual(toolRunnerArgStub.callCount, 2);
//             assert.deepEqual(toolRunnerExecStub.callCount, 1);
//             assert.isTrue(toolRunnerExecStub.calledWithExactly(<toolRunner.IExecOptions>{ silent: true }));
//         });
//     });

//     suite('Windows installer', () => {
//         const downloadFileName = 'shellcheck-latest.exe';
//         const shellcheckFileName = 'shellcheck.exe';
//         const downloadDirectory = 'c:/users/me/temp';
//         const downloadPath = `${downloadDirectory}/${shellcheckFileName}`;
//         let pathParseStub: Sinon.SinonStub;

//         setup(() => {
//             osTypeStub.callsFake(() => 'Windows_NT');
//             toolLibDownloadStub.callsFake(() => Promise.resolve(downloadPath));
//             pathParseStub = Sinon.stub(path, 'parse');
//             pathParseStub.withArgs(downloadPath).callsFake(() => ({ dir: downloadDirectory }));
//         });

//         test('Should install correctly', async () => {
//             const expectedDownloadUrl = `${shellCheckBinaryUrlBase}/${downloadFileName}`;
//             await installer.installShellCheck();
//             assert.isTrue(toolLibDownloadStub.calledWithExactly(expectedDownloadUrl, shellcheckFileName));
//             assert.isTrue(toolLibPrependPathStub.calledWithExactly(downloadDirectory));
//         });

//         test('Should bubble errors', async () => {
//             const errMessage = 'blue screen error';
//             toolLibDownloadStub.throws(new Error(errMessage));
//             try {
//                 await installer.installShellCheck();
//                 assert.isFalse(true);
//             } catch (err) {
//                 assert.deepEqual(err.message, errMessage);
//             }
//         });
//     });
// });
