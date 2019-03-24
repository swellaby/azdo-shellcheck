'use strict';

import chai = require('chai');
import path = require('path');
import Sinon = require('sinon');
import taskLib = require('azure-pipelines-task-lib');
import toolRunner = require('azure-pipelines-task-lib/toolrunner');

import installer = require('../../../../src/tasks/shellcheck/installer');
import OutputFormat = require('../../../../src/tasks/shellcheck/output-format');
import ShellDialect = require('../../../../src/tasks/shellcheck/shell-dialect');
import task = require('../../../../src/tasks/shellcheck/task');

const assert = chai.assert;

suite('task', () => {
    let taskLibDebugStub: Sinon.SinonStub;
    let taskLibFindMatchStub: Sinon.SinonStub;
    let taskLibGetInputStub: Sinon.SinonStub;
    let taskLibGetBoolInputStub: Sinon.SinonStub;
    let taskLibGetDelimitedInputStub: Sinon.SinonStub;
    let taskLibGetFollowSourcedFilesInputStub: Sinon.SinonStub;
    let taskLibGetCheckSourcedFilesInputStub: Sinon.SinonStub;
    let taskLibGetIgnoredErrorCodesInputStub: Sinon.SinonStub;
    let taskLibGetOutputFormatInputStub: Sinon.SinonStub;
    let taskLibGetShellDialectInputStub: Sinon.SinonStub;
    let taskLibGetUseRCFilesInputStub: Sinon.SinonStub;
    let taskLibSetResultStub: Sinon.SinonStub;
    let taskLibWarningStub: Sinon.SinonStub;
    const targetFiles = '**/*sh';
    const targetFilesInputKey = 'targetFiles';
    const followSourcedFiles = false;
    const followSourcedFilesInputKey = 'followSourcedFiles';
    const checkSourcedFiles = false;
    const checkSourcedFilesInputKey = 'checkSourcedFiles';
    const ignoredErrorCodes = [];
    const ignoredErrorCodesInputKey = 'ignoredErrorCodes';
    const outputFormat = 'tty';
    const outputFormatInputKey = 'outputFormat';
    const shellDialect = 'default';
    const shellDialectInputKey = 'shellDialect';
    const useRcFiles = true;
    const useRcFilesInputKey = 'useRcFiles';

    setup(() => {
        taskLibDebugStub = Sinon.stub(taskLib, 'debug');
        taskLibFindMatchStub = Sinon.stub(taskLib, 'findMatch').callsFake(() => []);
        taskLibGetInputStub = Sinon.stub(taskLib, 'getInput');
        taskLibGetInputStub.withArgs(outputFormatInputKey).callsFake(() => outputFormat);
        taskLibGetInputStub.withArgs(targetFilesInputKey).callsFake(() => targetFiles);
        taskLibGetBoolInputStub = Sinon.stub(taskLib, 'getBoolInput');
        taskLibGetFollowSourcedFilesInputStub = taskLibGetBoolInputStub.withArgs(followSourcedFilesInputKey).callsFake(() => followSourcedFiles);
        taskLibGetCheckSourcedFilesInputStub = taskLibGetBoolInputStub.withArgs(checkSourcedFilesInputKey).callsFake(() => checkSourcedFiles);
        taskLibGetUseRCFilesInputStub = taskLibGetBoolInputStub.withArgs(useRcFilesInputKey).callsFake(() => useRcFiles);
        taskLibGetDelimitedInputStub = Sinon.stub(taskLib, 'getDelimitedInput');
        taskLibGetIgnoredErrorCodesInputStub = taskLibGetDelimitedInputStub.withArgs(ignoredErrorCodesInputKey, '\n').callsFake(() => ignoredErrorCodes);
        taskLibGetOutputFormatInputStub = taskLibGetInputStub.withArgs(outputFormatInputKey).callsFake(() => outputFormat);
        taskLibGetShellDialectInputStub = taskLibGetInputStub.withArgs(shellDialectInputKey).callsFake(() => shellDialect);
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

        test('Should configure ignoredErrorCodes input correctly', async () => {
            await task.run();
            assert.isTrue(taskLibGetDelimitedInputStub.calledWithExactly(ignoredErrorCodesInputKey, '\n', false));
        });

        test('Should configure outputFormat input correctly', async () => {
            await task.run();
            assert.isTrue(taskLibGetInputStub.calledWithExactly(outputFormatInputKey, true));
        });

        test('Should configure shellDialect input correctly', async () => {
            await task.run();
            assert.isTrue(taskLibGetInputStub.calledWithExactly(shellDialectInputKey, true));
        });

        test('Should configure useRcFiles input correctly', async () => {
            await task.run();
            assert.isTrue(taskLibGetBoolInputStub.calledWithExactly(useRcFilesInputKey, true));
        });
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

            test('Should include -a arg when checkSourcedFiles is set to true', async () => {
                taskLibGetCheckSourcedFilesInputStub.callsFake(() => true);
                await task.run();
                assert.isTrue(toolRunnerArgIfStub.calledWithExactly(true, '-a'));
            });

            test('Should not include -a arg when checkSourcedFiles is set to false', async () => {
                taskLibGetCheckSourcedFilesInputStub.callsFake(() => false);
                await task.run();
                assert.isTrue(toolRunnerArgIfStub.calledWithExactly(false, '-a'));
            });

            test('Should include --norc arg when useRcFiles is set to false', async () => {
                taskLibGetUseRCFilesInputStub.callsFake(() => false);
                await task.run();
                assert.isTrue(toolRunnerArgIfStub.calledWithExactly(true, '--norc'));
            });

            test('Should not include --norc arg when useRcFiles is set to true', async () => {
                taskLibGetUseRCFilesInputStub.callsFake(() => true);
                await task.run();
                assert.isTrue(toolRunnerArgIfStub.calledWithExactly(false, '--norc'));
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

            suite('outputFormat Args', () => {
                test('Should include the correct outputFormat arg when format input is tty', async () => {
                    taskLibGetOutputFormatInputStub.callsFake(() => OutputFormat.tty);
                    await task.run();
                    let argCallCountStart = scripts.length;
                    assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly('-f'));
                    assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly(OutputFormat.tty));
                });

                test('Should include the correct outputFormat arg when format input is checkstyle', async () => {
                    taskLibGetOutputFormatInputStub.callsFake(() => OutputFormat.checkstyle);
                    await task.run();
                    let argCallCountStart = scripts.length;
                    assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly('-f'));
                    assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly(OutputFormat.checkstyle));
                });

                test('Should include the correct outputFormat arg when format input is gcc', async () => {
                    taskLibGetOutputFormatInputStub.callsFake(() => OutputFormat.gcc);
                    await task.run();
                    let argCallCountStart = scripts.length;
                    assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly('-f'));
                    assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly(OutputFormat.gcc));
                });

                test('Should include the correct outputFormat arg when format input is json', async () => {
                    taskLibGetOutputFormatInputStub.callsFake(() => OutputFormat.json);
                    await task.run();
                    let argCallCountStart = scripts.length;
                    assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly('-f'));
                    assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly(OutputFormat.json));
                });
            });

            suite('shellDialect Args', () => {
                test('Should not override default behavior shellDialect input is default', async () => {
                    taskLibGetShellDialectInputStub.callsFake(() => ShellDialect.default);
                    await task.run();
                    assert.isFalse(toolRunnerArgStub.calledWithExactly('-s'));
                });

                test('Should include the correct shellDialect arg when dialect input is sh', async () => {
                    taskLibGetShellDialectInputStub.callsFake(() => ShellDialect.sh);
                    await task.run();
                    let argCallCountStart = scripts.length + 2;
                    assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly('-s'));
                    assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly(ShellDialect.sh));
                });

                test('Should include the correct shellDialect arg when dialect input is bash', async () => {
                    taskLibGetShellDialectInputStub.callsFake(() => ShellDialect.bash);
                    await task.run();
                    let argCallCountStart = scripts.length + 2;
                    assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly('-s'));
                    assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly(ShellDialect.bash));
                });

                test('Should include the correct shellDialect arg when dialect input is dash', async () => {
                    taskLibGetShellDialectInputStub.callsFake(() => ShellDialect.dash);
                    await task.run();
                    let argCallCountStart = scripts.length + 2;
                    assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly('-s'));
                    assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly(ShellDialect.dash));
                });

                test('Should include the correct shellDialect arg when dialect input is ksh', async () => {
                    taskLibGetShellDialectInputStub.callsFake(() => ShellDialect.ksh);
                    await task.run();
                    let argCallCountStart = scripts.length + 2;
                    assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly('-s'));
                    assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly(ShellDialect.ksh));
                });
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
