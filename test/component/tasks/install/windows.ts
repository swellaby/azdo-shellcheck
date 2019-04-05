'use strict';

import chai = require('chai');
import path = require('path');
import Sinon = require('sinon');

import ShellCheckVersion = require('../../../../src/tasks/install/shellcheck-version');
import task = require('../../../../src/tasks/install/task');
import utils = require('../utils');

const assert = chai.assert;

suite('Windows Installation', () => {
    let taskLibGetVersionInputStub: Sinon.SinonStub;
    let toolLibPrependPathStub: Sinon.SinonStub;
    let toolLibDownloadStub: Sinon.SinonStub;
    const shellCheckBinaryUrlBase = utils.shellCheckBinaryUrlBase;
    const shellcheckFileName = 'shellcheck.exe';
    const downloadDirectory = 'c:/users/me/temp';
    const downloadPath = `${downloadDirectory}/${shellcheckFileName}`;

    setup(() => {
        taskLibGetVersionInputStub = utils.getTaskLibGetVersionInputStub();
        taskLibGetVersionInputStub.callsFake(() => ShellCheckVersion.stable);
        utils.getOsTypeStub().callsFake(() => 'Windows_NT');
        toolLibPrependPathStub = utils.getToolLibPrependPathStub();
        toolLibDownloadStub = utils.getToolLibDownloadStub();
        Sinon.stub(path, 'parse').withArgs(downloadPath).callsFake(() => (<path.ParsedPath>{ dir: downloadDirectory }));
        toolLibDownloadStub.callsFake(() => Promise.resolve(downloadPath));
    });

    teardown(() => {
        Sinon.restore();
    });

    const validate = (version: string) => {
        const expectedDownloadUrl = `${shellCheckBinaryUrlBase}/shellcheck-${version}.exe`;
        assert.isTrue(toolLibDownloadStub.calledWithExactly(expectedDownloadUrl, shellcheckFileName));
        assert.isTrue(toolLibPrependPathStub.calledWithExactly(downloadDirectory));
    };

    test('Should correctly install latest version', async () => {
        const version = ShellCheckVersion.latest;
        taskLibGetVersionInputStub.callsFake(() => version);
        await task.run();
        validate(version);
    });

    test('Should correctly install stable version', async () => {
        const version = ShellCheckVersion.stable;
        taskLibGetVersionInputStub.callsFake(() => version);
        await task.run();
        validate(version);
    });

    test('Should correctly install 0.6.0 version', async () => {
        const versionKey = '0.6.0';
        const version = ShellCheckVersion[versionKey];
        taskLibGetVersionInputStub.callsFake(() => versionKey);
        await task.run();
        validate(version);
    });

    test('Should correctly install 0.5.0 version', async () => {
        const versionKey = '0.5.0';
        const version = ShellCheckVersion[versionKey];
        taskLibGetVersionInputStub.callsFake(() => versionKey);
        await task.run();
        validate(version);
    });

    test('Should correctly install 0.4.7 version', async () => {
        const versionKey = '0.4.7';
        const version = ShellCheckVersion[versionKey];
        taskLibGetVersionInputStub.callsFake(() => versionKey);
        await task.run();
        validate(version);
    });

    test('Should correctly install 0.4.6 version', async () => {
        const versionKey = '0.4.6';
        const version = ShellCheckVersion[versionKey];
        taskLibGetVersionInputStub.callsFake(() => versionKey);
        await task.run();
        validate(version);
    });
});
