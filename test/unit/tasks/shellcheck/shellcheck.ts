'use strict';

import chai = require('chai');
import path = require('path');
import Sinon = require('sinon');
import taskLib = require('azure-pipelines-task-lib');
import toolRunner = require('azure-pipelines-task-lib/toolrunner');

import IInputs = require('../../../../src/tasks/shellcheck/inputs');
import OutputFormat = require('../../../../src/tasks/shellcheck/output-format');
import ShellDialect = require('../../../../src/tasks/shellcheck/shell-dialect');
import shellCheck = require('../../../../src/tasks/shellcheck/shellcheck');

const assert = chai.assert;

suite('shellcheck', () => {
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
    const failedResult = taskLib.TaskResult.Failed;
    const defaultInputs = <IInputs>{
        targetFiles: '**/.sh',
        scriptFiles: scripts,
        checkSourcedFiles: false,
        followSourcedFiles: false,
        ignoredErrorCodes: [],
        outputFormat: OutputFormat.tty,
        shellDialect: ShellDialect.default,
        useRcFiles: true
    };
    let inputs: IInputs;
    let pathNormalizeStub: Sinon.SinonStub;
    let toolRunnerArgStub: Sinon.SinonStub;
    let toolRunnerArgIfStub: Sinon.SinonStub;
    let toolRunnerExecStub: Sinon.SinonStub;
    let probeShellCheckStub: Sinon.SinonStub;
    let taskLibWhichStub: Sinon.SinonStub;
    let taskLibDebugStub: Sinon.SinonStub;
    let taskLibSetResultStub: Sinon.SinonStub;

    const toolRunnerStub: toolRunner.ToolRunner = <toolRunner.ToolRunner> {
        arg: (_val) => null,
        argIf: (_condition, _val) => null,
        exec: (_options) => null
    };

    setup(() => {
        taskLibWhichStub = Sinon.stub(taskLib, 'which').callsFake(() => '/usr/bin/shellcheck');
        taskLibSetResultStub = Sinon.stub(taskLib, 'setResult');
        taskLibDebugStub = Sinon.stub(taskLib, 'debug');
        Sinon.stub(taskLib, 'cwd').callsFake(() => baseDirectory);
        pathNormalizeStub = Sinon.stub(path, 'normalize');
        pathNormalizeStub.withArgs(`${baseDirectory}/`).callsFake((p) => p);
        Sinon.stub(taskLib, 'tool').callsFake(() => toolRunnerStub);
        toolRunnerArgStub = Sinon.stub(toolRunnerStub, 'arg').callsFake(() => toolRunnerStub);
        toolRunnerArgIfStub = Sinon.stub(toolRunnerStub, 'argIf').callsFake(() => toolRunnerStub);
        toolRunnerExecStub = Sinon.stub(toolRunnerStub, 'exec').callsFake(() => 0);
        probeShellCheckStub = taskLibWhichStub.withArgs(shellCheckExecutable, false);
        inputs = JSON.parse(JSON.stringify(defaultInputs));
    });

    teardown(() => {
        Sinon.restore();
        inputs = null;
    });

    test('Should fail when ShellCheck is not installed', async () => {
        probeShellCheckStub.callsFake(() => undefined);
        await shellCheck.run(inputs);
        assert.isFalse(toolRunnerExecStub.called);
        const message = 'ShellCheck executable not found. Add the ShellCheck Installer task to your pipeline, or manually install ShellCheck on your agent';
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, message, true));
    });

    test('Should handle fatal error gracefully when error has no details', async () => {
        toolRunnerExecStub.throws(new Error());
        await shellCheck.run(inputs);
        assert.isTrue(taskLibDebugStub.calledWithExactly('Error details: unknown'));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, shellCheckFailureErrorMessage, true));
    });

    test('Should handle fatal error gracefully when error has details', async () => {
        const errorDetails = 'ShellCheck install failed';
        toolRunnerExecStub.throws(new Error(errorDetails));
        await shellCheck.run(inputs);
        assert.isTrue(taskLibDebugStub.calledWithExactly(`Error details: ${errorDetails}`));
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, shellCheckFailureErrorMessage, true));
    });

    test('Should fail the task when ShellCheck scan fails', async () => {
        toolRunnerExecStub.callsFake(() => 3);
        await shellCheck.run(inputs);
        assert.isTrue(taskLibSetResultStub.calledWithExactly(failedResult, shellCheckFailureErrorMessage, true));
    });

    test('Should complete the task successfully when ShellCheck scan passes', async () => {
        const expectedMessage = 'ShellCheck scan succeeded!';
        const succeededResult = taskLib.TaskResult.Succeeded;
        toolRunnerExecStub.callsFake(() => 0);
        await shellCheck.run(inputs);
        assert.isTrue(taskLibSetResultStub.calledWithExactly(succeededResult, expectedMessage, true));
    });

    suite('ShellCheck Args', () => {
        test('Should provide correct script file args to ShellCheck', async () => {
            await shellCheck.run(inputs);
            assert.isTrue(toolRunnerArgStub.calledWithExactly(firstScript));
            assert.isTrue(toolRunnerArgStub.calledWithExactly(secondScript));
            assert.isTrue(toolRunnerArgStub.calledWithExactly(thirdScript));
        });

        test('Should include -x arg when followSourcedFiles is set to true', async () => {
            inputs.followSourcedFiles = true;
            await shellCheck.run(inputs);
            assert.isTrue(toolRunnerArgIfStub.calledWithExactly(true, '-x'));
        });

        test('Should not include -x arg when followSourcedFiles is set to false', async () => {
            inputs.followSourcedFiles = false;
            await shellCheck.run(inputs);
            assert.isTrue(toolRunnerArgIfStub.calledWithExactly(false, '-x'));
        });

        test('Should include -a arg when checkSourcedFiles is set to true', async () => {
            inputs.checkSourcedFiles = true;
            await shellCheck.run(inputs);
            assert.isTrue(toolRunnerArgIfStub.calledWithExactly(true, '-a'));
        });

        test('Should not include -a arg when checkSourcedFiles is set to false', async () => {
            inputs.checkSourcedFiles = false;
            await shellCheck.run(inputs);
            assert.isTrue(toolRunnerArgIfStub.calledWithExactly(false, '-a'));
        });

        test('Should include --norc arg when useRcFiles is set to false', async () => {
            inputs.useRcFiles = false;
            await shellCheck.run(inputs);
            assert.isTrue(toolRunnerArgIfStub.calledWithExactly(true, '--norc'));
        });

        test('Should not include --norc arg when useRcFiles is set to true', async () => {
            inputs.useRcFiles = true;
            await shellCheck.run(inputs);
            assert.isTrue(toolRunnerArgIfStub.calledWithExactly(false, '--norc'));
        });

        test('Should not include any ignore args when ignoredErrorCodes is unset', async () => {
            inputs.ignoredErrorCodes = [];
            await shellCheck.run(inputs);
            assert.isFalse(toolRunnerArgStub.calledWith('-e'));
        });

        test('Should include ignore arg and error code when ignoredErrorCodes is set', async () => {
            const firstErrorCode = 'SC2059';
            const secondErrorCode = 'SC2011';
            inputs.ignoredErrorCodes = [ firstErrorCode, secondErrorCode ];
            await shellCheck.run(inputs);
            let argCallCountStart = scripts.length;
            assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly('-e'));
            assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly(firstErrorCode));
            assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly('-e'));
            assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly(secondErrorCode));
        });

        suite('outputFormat Args', () => {
            test('Should include the correct outputFormat arg when format input is tty', async () => {
                inputs.outputFormat = OutputFormat.tty;
                await shellCheck.run(inputs);
                let argCallCountStart = scripts.length;
                assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly('-f'));
                assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly(OutputFormat.tty));
            });

            test('Should include the correct outputFormat arg when format input is checkstyle', async () => {
                inputs.outputFormat = OutputFormat.checkstyle;
                await shellCheck.run(inputs);
                let argCallCountStart = scripts.length;
                assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly('-f'));
                assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly(OutputFormat.checkstyle));
            });

            test('Should include the correct outputFormat arg when format input is gcc', async () => {
                inputs.outputFormat = OutputFormat.gcc;
                await shellCheck.run(inputs);
                let argCallCountStart = scripts.length;
                assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly('-f'));
                assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly(OutputFormat.gcc));
            });

            test('Should include the correct outputFormat arg when format input is json', async () => {
                inputs.outputFormat = OutputFormat.json;
                await shellCheck.run(inputs);
                let argCallCountStart = scripts.length;
                assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly('-f'));
                assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly(OutputFormat.json));
            });
        });

        suite('shellDialect Args', () => {
            test('Should not override default behavior shellDialect input is default', async () => {
                inputs.shellDialect = ShellDialect.default;
                await shellCheck.run(inputs);
                assert.isFalse(toolRunnerArgStub.calledWithExactly('-s'));
            });

            test('Should include the correct shellDialect arg when dialect input is sh', async () => {
                inputs.shellDialect = ShellDialect.sh;
                await shellCheck.run(inputs);
                let argCallCountStart = scripts.length + 2;
                assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly('-s'));
                assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly(ShellDialect.sh));
            });

            test('Should include the correct shellDialect arg when dialect input is bash', async () => {
                inputs.shellDialect = ShellDialect.bash;
                await shellCheck.run(inputs);
                let argCallCountStart = scripts.length + 2;
                assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly('-s'));
                assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly(ShellDialect.bash));
            });

            test('Should include the correct shellDialect arg when dialect input is dash', async () => {
                inputs.shellDialect = ShellDialect.dash;
                await shellCheck.run(inputs);
                let argCallCountStart = scripts.length + 2;
                assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly('-s'));
                assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly(ShellDialect.dash));
            });

            test('Should include the correct shellDialect arg when dialect input is ksh', async () => {
                inputs.shellDialect = ShellDialect.ksh;
                await shellCheck.run(inputs);
                let argCallCountStart = scripts.length + 2;
                assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly('-s'));
                assert.isTrue(toolRunnerArgStub.getCall(argCallCountStart++).calledWithExactly(ShellDialect.ksh));
            });
        });
    });
});
