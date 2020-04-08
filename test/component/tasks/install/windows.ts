'use strict';

import chai = require('chai');
import Sinon = require('sinon');

import ShellCheckVersion = require('../../../../src/tasks/install/shellcheck-version');
import task = require('../../../../src/tasks/install/task');
import utils = require('../../../utils');

const assert = chai.assert;

suite('Windows Installation', () => {
    let taskLibGetVersionInputStub: Sinon.SinonStub;
    let taskLibMvStub: Sinon.SinonStub;
    let toolLibPrependPathStub: Sinon.SinonStub;
    let toolLibDownloadStub: Sinon.SinonStub;
    let toolLibExtractZipStub: Sinon.SinonStub;
    const shellCheckBinaryUrlBase = utils.shellCheckBinaryUrlBase;
    const downloadDirectory = 'c:/users/me/temp';
    const extractionDirectory = 'd:/agent/_work/temp/abc123def456';
    const downloadPath = `${downloadDirectory}/shellcheck-version.zip`;

    setup(() => {
        taskLibGetVersionInputStub = utils.getTaskLibGetVersionInputStub();
        taskLibGetVersionInputStub.callsFake(() => ShellCheckVersion.stable);
        taskLibMvStub = utils.getTaskLibMvStub();
        utils.getOsTypeStub().callsFake(() => 'Windows_NT');
        toolLibPrependPathStub = utils.getToolLibPrependPathStub();
        toolLibDownloadStub = utils.getToolLibDownloadStub();
        toolLibDownloadStub.callsFake(() => Promise.resolve(downloadPath));
        toolLibExtractZipStub = utils.getToolLibExtractZipStub();
        toolLibExtractZipStub.callsFake(() => Promise.resolve(extractionDirectory));
    });

    teardown(() => {
        Sinon.restore();
    });

    const validate = (version: string) => {
        const expectedDownloadUrl = `${shellCheckBinaryUrlBase}/${version}/shellcheck-${version}.zip`;
        const expectedDownloadFile = `shellcheck-${version}.zip`;
        assert.isTrue(toolLibDownloadStub.calledWithExactly(expectedDownloadUrl, expectedDownloadFile));
        assert.isTrue(toolLibExtractZipStub.calledWithExactly(downloadPath));
        assert.isTrue(taskLibMvStub.calledWithExactly(
            `${extractionDirectory}/shellcheck-${version}.exe`,
            `${extractionDirectory}/shellcheck.exe`
        ));
        assert.isTrue(toolLibPrependPathStub.calledWithExactly(extractionDirectory));
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
