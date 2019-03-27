'use strict';

import chai = require('chai');
import Sinon = require('sinon');
import taskLib = require('azure-pipelines-task-lib');

import IInputs = require('../../../../src/tasks/shellcheck/inputs');
import OutputFormat = require('../../../../src/tasks/shellcheck/output-format');
import shellCheck = require('../../../../src/tasks/shellcheck/shellcheck');
import ShellDialect = require('../../../../src/tasks/shellcheck/shell-dialect');
import task = require('../../../../src/tasks/shellcheck/task');

const assert = chai.assert;

suite('Run ShellCheck task', () => {
    let shellCheckRunStub: Sinon.SinonStub;
    let taskLibDebugStub: Sinon.SinonStub;
    let taskLibFindMatchStub: Sinon.SinonStub;
    let taskLibGetInputStub: Sinon.SinonStub;
    let taskLibGetBoolInputStub: Sinon.SinonStub;
    let taskLibGetDelimitedInputStub: Sinon.SinonStub;
    let taskLibGetOutputFormatInputStub: Sinon.SinonStub;
    let taskLibGetShellDialectInputStub: Sinon.SinonStub;
    let taskLibSetResultStub: Sinon.SinonStub;
    let taskLibWarningStub: Sinon.SinonStub;
    const targetFiles = '**/*sh';
    const targetFilesInputKey = 'targetFiles';
    const matchedScriptFiles = [ 'foo.sh', 'bar.sh' ];
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
    const failedResult = taskLib.TaskResult.Failed;

    setup(() => {
        shellCheckRunStub = Sinon.stub(shellCheck, 'run');
        taskLibDebugStub = Sinon.stub(taskLib, 'debug');
        taskLibFindMatchStub = Sinon.stub(taskLib, 'findMatch').callsFake(() => matchedScriptFiles);
        taskLibGetInputStub = Sinon.stub(taskLib, 'getInput');
        taskLibGetInputStub.withArgs(outputFormatInputKey).callsFake(() => outputFormat);
        taskLibGetInputStub.withArgs(targetFilesInputKey).callsFake(() => targetFiles);
        taskLibGetBoolInputStub = Sinon.stub(taskLib, 'getBoolInput');
        taskLibGetBoolInputStub.withArgs(followSourcedFilesInputKey).callsFake(() => followSourcedFiles);
        taskLibGetBoolInputStub.withArgs(checkSourcedFilesInputKey).callsFake(() => checkSourcedFiles);
        taskLibGetBoolInputStub.withArgs(useRcFilesInputKey).callsFake(() => useRcFiles);
        taskLibGetDelimitedInputStub = Sinon.stub(taskLib, 'getDelimitedInput');
        taskLibGetDelimitedInputStub.withArgs(ignoredErrorCodesInputKey, '\n').callsFake(() => ignoredErrorCodes);
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

        test('Should configure useRcFiles input correctly', async () => {
            await task.run();
            assert.isTrue(taskLibGetBoolInputStub.calledWithExactly(useRcFilesInputKey, true));
        });

        suite('outputFormat input', () => {
            test('Should configure outputFormat input correctly', async () => {
                await task.run();
                assert.isTrue(taskLibGetInputStub.calledWithExactly(outputFormatInputKey, true));
            });

            test('Should accept checkstyle for outputFormat value', async () => {
                taskLibGetOutputFormatInputStub.callsFake(() => OutputFormat.checkstyle);
                await task.run();
                assert.deepEqual((<IInputs>shellCheckRunStub.firstCall.args[0]).outputFormat, OutputFormat.checkstyle);
                assert.isFalse(taskLibSetResultStub.called);
            });

            test('Should accept gcc for outputFormat value', async () => {
                taskLibGetOutputFormatInputStub.callsFake(() => OutputFormat.gcc);
                await task.run();
                assert.deepEqual((<IInputs>shellCheckRunStub.firstCall.args[0]).outputFormat, OutputFormat.gcc);
                assert.isFalse(taskLibSetResultStub.called);
            });

            test('Should accept json for outputFormat value', async () => {
                taskLibGetOutputFormatInputStub.callsFake(() => OutputFormat.json);
                await task.run();
                assert.deepEqual((<IInputs>shellCheckRunStub.firstCall.args[0]).outputFormat, OutputFormat.json);
                assert.isFalse(taskLibSetResultStub.called);
            });

            test('Should accept tty for outputFormat value', async () => {
                taskLibGetOutputFormatInputStub.callsFake(() => OutputFormat.tty);
                await task.run();
                assert.deepEqual((<IInputs>shellCheckRunStub.firstCall.args[0]).outputFormat, OutputFormat.tty);
                assert.isFalse(taskLibSetResultStub.called);
            });

            test('Should fail the task if an invalid outputFormat is specified', async () => {
                const invalidOutputFormat = 'yaml';
                taskLibGetOutputFormatInputStub.callsFake(() => invalidOutputFormat);
                await task.run();
                const message = `Invalid OutputFormat: '${invalidOutputFormat}'. Allowed values are: tty, checkstyle, gcc, json.`;
                assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, message, true));
                assert.isFalse(shellCheckRunStub.called);
            });
        });

        suite('shellDialect input', () => {
            test('Should configure shellDialect input correctly', async () => {
                await task.run();
                assert.isTrue(taskLibGetInputStub.calledWithExactly(shellDialectInputKey, true));
            });

            test('Should accept default for shellDialect value', async () => {
                taskLibGetShellDialectInputStub.callsFake(() => ShellDialect.default);
                await task.run();
                assert.deepEqual((<IInputs>shellCheckRunStub.firstCall.args[0]).shellDialect, ShellDialect.default);
                assert.isFalse(taskLibSetResultStub.called);
            });

            test('Should accept bash for shellDialect value', async () => {
                taskLibGetShellDialectInputStub.callsFake(() => ShellDialect.bash);
                await task.run();
                assert.deepEqual((<IInputs>shellCheckRunStub.firstCall.args[0]).shellDialect, ShellDialect.bash);
                assert.isFalse(taskLibSetResultStub.called);
            });

            test('Should accept dash for shellDialect value', async () => {
                taskLibGetShellDialectInputStub.callsFake(() => ShellDialect.dash);
                await task.run();
                assert.deepEqual((<IInputs>shellCheckRunStub.firstCall.args[0]).shellDialect, ShellDialect.dash);
                assert.isFalse(taskLibSetResultStub.called);
            });

            test('Should accept ksh for shellDialect value', async () => {
                taskLibGetShellDialectInputStub.callsFake(() => ShellDialect.ksh);
                await task.run();
                assert.deepEqual((<IInputs>shellCheckRunStub.firstCall.args[0]).shellDialect, ShellDialect.ksh);
                assert.isFalse(taskLibSetResultStub.called);
            });

            test('Should accept sh for shellDialect value', async () => {
                taskLibGetShellDialectInputStub.callsFake(() => ShellDialect.sh);
                await task.run();
                assert.deepEqual((<IInputs>shellCheckRunStub.firstCall.args[0]).shellDialect, ShellDialect.sh);
                assert.isFalse(taskLibSetResultStub.called);
            });

            test('Should fail the task if an invalid dialect is specified', async () => {
                const invalidDialect = 'Mandarin';
                taskLibGetShellDialectInputStub.callsFake(() => invalidDialect);
                await task.run();
                const message = `Invalid ShellDialect: '${invalidDialect}'. Allowed values are: default, bash, dash, ksh, sh.`;
                assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, message, true));
                assert.isFalse(shellCheckRunStub.called);
            });
        });
    });

    suite('run', () => {
        const fatalErrorMessage = 'Fatal error. Enable debugging to see error details.';

        test('Should fail task with correct error message when error is thrown with no details', async () => {
            taskLibFindMatchStub.throws(() => new Error());
            await task.run();
            assert.isTrue(taskLibDebugStub.calledWithExactly('Error details: unknown'));
            assert.isTrue(taskLibSetResultStub.calledWith(failedResult, fatalErrorMessage));
        });

        test('Should fail task with correct error message when error is thrown with details', async () => {
            const errorMessage = 'winter has come';
            taskLibFindMatchStub.throws(() => new Error(errorMessage));
            await task.run();
            assert.isTrue(taskLibDebugStub.calledWithExactly(`Error details: ${errorMessage}`));
            assert.isTrue(taskLibSetResultStub.calledWith(failedResult, fatalErrorMessage));
        });

        test('Should warn and exit successfully when no script files are found', async () => {
            taskLibFindMatchStub.callsFake(() => []);
            await task.run();
            assert.isTrue(taskLibWarningStub.calledWithExactly(`No shell files found for input '${targetFiles}'.`));
            assert.isFalse(taskLibSetResultStub.called);
            assert.isFalse(shellCheckRunStub.called);
        });

        test('Should handle any errors thrown by ShellCheck runner', async () => {
            shellCheckRunStub.throws(() => new Error());
            await task.run();
            assert.isTrue(shellCheckRunStub.called);
            assert.isTrue(taskLibSetResultStub.calledWith(failedResult, fatalErrorMessage));
        });

        test('Should pass correct input arguments to runner', async () => {
            await task.run();
            assert.isTrue(shellCheckRunStub.calledWithExactly({
                scriptFiles: matchedScriptFiles,
                targetFiles,
                followSourcedFiles,
                checkSourcedFiles,
                ignoredErrorCodes,
                outputFormat,
                shellDialect,
                useRcFiles
            }));
        });
    });
});
