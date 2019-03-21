'use strict';

import chai = require('chai');
import Sinon = require('sinon');
import taskLib = require('azure-pipelines-task-lib');

import installer = require('../../../../src/tasks/shellcheck/installer');
import task = require('../../../../src/tasks/shellcheck/task');

const assert = chai.assert;

suite('task', () => {
    let debugStub: Sinon.SinonStub;
    let getInputStub: Sinon.SinonStub;
    let setResultStub: Sinon.SinonStub;
    const format = 'junit';
    const formatInputKey = 'format';
    const targetFiles = '**/*sh';
    const targetFilesInputKey = 'targetFiles';

    setup(() => {
        debugStub = Sinon.stub(taskLib, 'debug');
        getInputStub = Sinon.stub(taskLib, 'getInput');
        getInputStub.withArgs(formatInputKey).callsFake(() => format);
        getInputStub.withArgs(targetFilesInputKey).callsFake(() => targetFiles);
        setResultStub = Sinon.stub(taskLib, 'setResult');
    });

    teardown(() => {
        Sinon.restore();
    });

    suite('input config', () => {
        test('Should configure format input correctly', async () => {
            await task.run();
            assert.isTrue(getInputStub.calledWithExactly(formatInputKey, true));
        });

        test('Should configure targetFiles input correctly', async () => {
            await task.run();
            assert.isTrue(getInputStub.calledWithExactly(targetFilesInputKey, true));
        });
    });

    suite('run', () => {
        test('Should fail task with correct error message when error is thrown', async () => {
            debugStub.throws(() => new Error());
            await task.run();
            assert.isTrue(setResultStub.calledWith(taskLib.TaskResult.Failed, 'crashed'));
        });
    });
});
