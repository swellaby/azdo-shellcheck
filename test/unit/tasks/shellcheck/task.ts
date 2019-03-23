'use strict';

import chai = require('chai');
import path = require('path');
import Sinon = require('sinon');
import taskLib = require('azure-pipelines-task-lib');
import toolRunner = require('azure-pipelines-task-lib/toolrunner');

import installer = require('../../../../src/tasks/shellcheck/installer');
import task = require('../../../../src/tasks/shellcheck/task');

const assert = chai.assert;

suite('task', () => {
    let taskLibDebugStub: Sinon.SinonStub;
    let taskLibFindMatchStub: Sinon.SinonStub;
    let taskLibGetInputStub: Sinon.SinonStub;
    let taskLibGetBoolInputStub: Sinon.SinonStub;
    let taskLibGetDelimitedInputStub: Sinon.SinonStub;
    let taskLibGetFollowSourcedFilesInputStub: Sinon.SinonStub;
    let taskLibGetIgnoredErrorCodesInputStub: Sinon.SinonStub;
    let taskLibSetResultStub: Sinon.SinonStub;
    let taskLibWarningStub: Sinon.SinonStub;
    const targetFiles = '**/*sh';
    const targetFilesInputKey = 'targetFiles';
    const followSourcedFiles = false;
    const followSourcedFilesInputKey = 'followSourcedFiles';
    const ignoredErrorCodes = [];
    const ignoredErrorCodesInputKey = 'ignoredErrorCodes';
    const format = 'junit';
    const formatInputKey = 'format';

    setup(() => {
        taskLibDebugStub = Sinon.stub(taskLib, 'debug');
        taskLibFindMatchStub = Sinon.stub(taskLib, 'findMatch').callsFake(() => []);
        taskLibGetInputStub = Sinon.stub(taskLib, 'getInput');
        taskLibGetInputStub.withArgs(formatInputKey).callsFake(() => format);
        taskLibGetInputStub.withArgs(targetFilesInputKey).callsFake(() => targetFiles);
        taskLibGetBoolInputStub = Sinon.stub(taskLib, 'getBoolInput');
        taskLibGetFollowSourcedFilesInputStub = taskLibGetBoolInputStub.withArgs(followSourcedFilesInputKey).callsFake(() => followSourcedFiles);
        taskLibGetDelimitedInputStub = Sinon.stub(taskLib, 'getDelimitedInput');
        taskLibGetIgnoredErrorCodesInputStub = taskLibGetDelimitedInputStub.withArgs(ignoredErrorCodesInputKey, '\n').callsFake(() => ignoredErrorCodes);
        taskLibSetResultStub = Sinon.stub(taskLib, 'setResult');
        taskLibWarningStub = Sinon.stub(taskLib, 'warning');
    });

    teardown(() => {
        Sinon.restore();
    });

    suite('input config', () => {
        test('Should configure targetFiles input correctly', async () => {
            await task.run();
            assert.isTrue(taskLibGetInputStub.calledWithExactly(targetFilesInputKey, true));
        });

        test('Should configure followSourcedFiles input correctly', async () => {
            await task.run();
            assert.isTrue(taskLibGetBoolInputStub.calledWithExactly(followSourcedFilesInputKey, true));
        });

        // test('Should configure format input correctly', async () => {
        //     await task.run();
        //     assert.isTrue(getInputStub.calledWithExactly(formatInputKey, true));
        // });
    });

    suite('run', () => {
        const fatalErrorMessage = 'Fatal error. Enable debugging to see error details.';
        const failedResult = taskLib.TaskResult.Failed;
        let installShellCheckStub: Sinon.SinonStub;
        let taskLibWhichStub: Sinon.SinonStub;

        setup(() => {
            installShellCheckStub = Sinon.stub(installer, 'installShellCheck').callsFake(() => Promise.resolve());
            taskLibWhichStub = Sinon.stub(taskLib, 'which');
        });

        test('Should fail task with correct error message when error is thrown', async () => {
            taskLibFindMatchStub.throws(() => new Error());
            await task.run();
            assert.isTrue(taskLibSetResultStub.calledWith(failedResult, fatalErrorMessage));
        });

        test('Should warn and exit successfully when no script files are found', async () => {
            await task.run();
            assert.isTrue(taskLibWarningStub.calledWithExactly(`No shell files found for input '${targetFiles}'.`));
            assert.isFalse(taskLibSetResultStub.called);
            assert.isFalse(taskLibWhichStub.called);
        });

        suite('runShellCheck', () => {
            const baseDirectory = '/users/me/test';
            const firstScript = 'foo.sh';
            const secondScript = 'base.sh';
            const thirdScript = 'dir/foo-bar.sh';
            const scripts = [
                `${baseDirectory}/${firstScript}`,
                `${baseDirectory}/${secondScript}`,
                `${baseDirectory}/${thirdScript}`
            ];
            const shellCheckFailureErrorMessage = 'ShellCheck scan failed! Check the logs for violation details.';
            const shellCheckExecutable = 'shellcheck';
            const installingShellCheckDebugMessage = 'ShellCheck not found. Installing now...';
            let pathNormalizeStub: Sinon.SinonStub;
            let toolRunnerArgStub: Sinon.SinonStub;
            let toolRunnerArgIfStub: Sinon.SinonStub;
            let toolRunnerExecStub: Sinon.SinonStub;
            let probeShellCheckStub: Sinon.SinonStub;

            const toolRunnerStub: toolRunner.ToolRunner = <toolRunner.ToolRunner> {
                arg: (_val) => null,
                argIf: (_condition, _val) => null,
                exec: (_options) => null
            };

            setup(() => {
                Sinon.stub(taskLib, 'cwd').callsFake(() => baseDirectory);
                pathNormalizeStub = Sinon.stub(path, 'normalize');
                pathNormalizeStub.withArgs(`${baseDirectory}/`).callsFake((p) => p);
                taskLibFindMatchStub.callsFake(() => scripts);
                Sinon.stub(taskLib, 'tool').callsFake(() => toolRunnerStub);
                toolRunnerArgStub = Sinon.stub(toolRunnerStub, 'arg').callsFake(() => toolRunnerStub);
                toolRunnerArgIfStub = Sinon.stub(toolRunnerStub, 'argIf').callsFake(() => toolRunnerStub);
                toolRunnerExecStub = Sinon.stub(toolRunnerStub, 'exec').callsFake(() => 0);
                probeShellCheckStub = taskLibWhichStub.withArgs(shellCheckExecutable, false);
            });

            test('Should install ShellCheck if it does not already exist', async () => {
                probeShellCheckStub.callsFake(() => false);
                await task.run();
                assert.isTrue(taskLibDebugStub.calledWithExactly(installingShellCheckDebugMessage));
                assert.isTrue(installShellCheckStub.called);
            });

            test('Should not install ShellCheck if it already exists', async () => {
                probeShellCheckStub.callsFake(() => true);
                await task.run();
                assert.isFalse(taskLibDebugStub.calledWithExactly(installingShellCheckDebugMessage));
                assert.isFalse(installShellCheckStub.called);
            });

            test('Should handle fatal error gracefully when error has no details', async () => {
                probeShellCheckStub.throws(new Error());
                await task.run();
                assert.isTrue(taskLibDebugStub.calledWithExactly('Error details: unknown'));
                assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, shellCheckFailureErrorMessage));
            });

            test('Should handle fatal error gracefully when error has details', async () => {
                const errorDetails = 'ShellCheck install failed';
                installShellCheckStub.throws(new Error(errorDetails));
                await task.run();
                assert.isTrue(taskLibDebugStub.calledWithExactly(`Error details: ${errorDetails}`));
                assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, shellCheckFailureErrorMessage));
            });

            test('Should fail the task when ShellCheck scan fails', async () => {
                toolRunnerExecStub.callsFake(() => 3);
                await task.run();
                assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, shellCheckFailureErrorMessage));
            });

            test('Should provide correct script file args to ShellCheck', async () => {
                await task.run();
                assert.isTrue(toolRunnerArgStub.calledWithExactly(firstScript));
                assert.isTrue(toolRunnerArgStub.calledWithExactly(secondScript));
                assert.isTrue(toolRunnerArgStub.calledWithExactly(thirdScript));
            });

            test('Should include -x arg when followSourcedFiles is set to true', async () => {
                taskLibGetFollowSourcedFilesInputStub.callsFake(() => true);
                await task.run();
                assert.isTrue(toolRunnerArgIfStub.calledWithExactly(true, '-x'));
            });

            test('Should not include -x arg when followSourcedFiles is set to false', async () => {
                taskLibGetFollowSourcedFilesInputStub.callsFake(() => false);
                await task.run();
                assert.isTrue(toolRunnerArgIfStub.calledWithExactly(false, '-x'));
            });

            test('Should not include any ignore args when ignoredErrorCodes is unset', async () => {
                taskLibGetIgnoredErrorCodesInputStub.callsFake(() => []);
                await task.run();
                assert.isFalse(toolRunnerArgStub.calledWith('-e'));
            });

            test('Should include ignore arg and error code when ignoredErrorCodes is set', async () => {
                const firstErrorCode = 'SC2059';
                const secondErrorCode = 'SC2011';
                taskLibGetIgnoredErrorCodesInputStub.callsFake(() => [ firstErrorCode, secondErrorCode ]);
                await task.run();
                let argCallCountStart = scripts.length;
                assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly('-e'));
                assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly(firstErrorCode));
                assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly('-e'));
                assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly(secondErrorCode));
            });

            test('Should complete the task successfully when ShellCheck scan passes', async () => {
                const expectedMessage = 'ShellCheck scan succeeded!';
                const succeededResult = taskLib.TaskResult.Succeeded;
                toolRunnerExecStub.callsFake(() => 0);
                await task.run();
                assert.isTrue(taskLibSetResultStub.calledWithExactly(succeededResult, expectedMessage, true));
            });
        });
    });
});
