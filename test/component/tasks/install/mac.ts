'use strict';

import chai = require('chai');
import Sinon = require('sinon');
import toolRunner = require('azure-pipelines-task-lib/toolrunner');

import ShellCheckVersion = require('../../../../src/tasks/install/shellcheck-version');
import task = require('../../../../src/tasks/install/task');
import utils = require('../utils');

const assert = chai.assert;

suite('Mac Installation', () => {
    let taskLibGetVersionInputStub: Sinon.SinonStub;
    let taskLibWarningStub: Sinon.SinonStub;
    let taskLibToolStub: Sinon.SinonStub;
    let toolRunnerArgStub: Sinon.SinonStub;
    let toolRunnerExecStub: Sinon.SinonStub;

    setup(() => {
        taskLibWarningStub = utils.getTaskLibWarningStub();
        taskLibGetVersionInputStub = utils.getTaskLibGetVersionInputStub();
        taskLibGetVersionInputStub.callsFake(() => ShellCheckVersion.stable);
        utils.getOsTypeStub().callsFake(() => 'Darwin');
        taskLibToolStub = utils.getTaskLibToolStub();
        toolRunnerArgStub = utils.getToolRunnerArgStub();
        toolRunnerExecStub = utils.getToolRunnerExecStub();
    });

    teardown(() => {
        Sinon.restore();
    });

    const validateInstall = () => {
        assert.isTrue(taskLibToolStub.calledOnceWithExactly('brew'));
        assert.isTrue(toolRunnerArgStub.firstCall.calledWithExactly('install'));
        assert.isTrue(toolRunnerArgStub.secondCall.calledWithExactly('shellcheck'));
        assert.deepEqual(toolRunnerArgStub.callCount, 2);
        assert.deepEqual(toolRunnerExecStub.callCount, 1);
        assert.isTrue(toolRunnerExecStub.calledWithExactly(<toolRunner.IExecOptions>{ silent: true }));
    };

    test('Should not display warning for stable version', async () => {
        const version = ShellCheckVersion.stable;
        taskLibGetVersionInputStub.callsFake(() => version);
        await task.run();
        validateInstall();
        assert.isFalse(taskLibWarningStub.called);
    });

    test('Should display warning for latest version', async () => {
        const version = ShellCheckVersion.latest;
        taskLibGetVersionInputStub.callsFake(() => version);
        const expectedWarningMessage = utils.getMacInstallWarningMessage(version);
        await task.run();
        validateInstall();
        assert.isTrue(taskLibWarningStub.calledOnceWithExactly(expectedWarningMessage));
    });

    test('Should display warning for version 0.6.0', async () => {
        const versionKey = '0.6.0';
        const version = ShellCheckVersion[versionKey];
        taskLibGetVersionInputStub.callsFake(() => versionKey);
        const expectedWarningMessage = utils.getMacInstallWarningMessage(version);
        await task.run();
        validateInstall();
        assert.isTrue(taskLibWarningStub.calledOnceWithExactly(expectedWarningMessage));
    });

    test('Should display warning for version 0.5.0', async () => {
        const versionKey = '0.5.0';
        const version = ShellCheckVersion[versionKey];
        taskLibGetVersionInputStub.callsFake(() => versionKey);
        const expectedWarningMessage = utils.getMacInstallWarningMessage(version);
        await task.run();
        validateInstall();
        assert.isTrue(taskLibWarningStub.calledOnceWithExactly(expectedWarningMessage));
    });

    test('Should display warning for version 0.4.7', async () => {
        const versionKey = '0.4.7';
        const version = ShellCheckVersion[versionKey];
        taskLibGetVersionInputStub.callsFake(() => versionKey);
        const expectedWarningMessage = utils.getMacInstallWarningMessage(version);
        await task.run();
        validateInstall();
        assert.isTrue(taskLibWarningStub.calledOnceWithExactly(expectedWarningMessage));
    });

    test('Should display warning for version 0.4.6', async () => {
        const versionKey = '0.4.6';
        const version = ShellCheckVersion[versionKey];
        taskLibGetVersionInputStub.callsFake(() => versionKey);
        const expectedWarningMessage = utils.getMacInstallWarningMessage(version);
        await task.run();
        validateInstall();
        assert.isTrue(taskLibWarningStub.calledOnceWithExactly(expectedWarningMessage));
    });
});
