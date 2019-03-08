'use strict';

import os = require('os');
import path = require('path');

import taskLib = require('azure-pipelines-task-lib');
import toolLib = require('azure-pipelines-tool-lib');

const shellCheckBinaryUrlBase = 'https://shellcheck.storage.googleapis.com';

/**
 * @private
 */
const installForLinux = async () => {
    const architecture = os.arch();
    let tarballName;
    if (architecture === 'x64') {
        tarballName = 'shellcheck-stable.linux.x86_64.tar.xz';
    } else if (architecture === 'arm64') {
        tarballName = 'shellcheck-stable.linux.armv6hf.tar.xz';
    } else {
        throw new Error(`Unsupported architecture ${architecture}`);
    }

    const downloadUrl = `${shellCheckBinaryUrlBase}/${tarballName}`;
    const tarballLocation = await toolLib.downloadTool(downloadUrl);
    const extractRoot = await toolLib.extractTar(tarballLocation);
    toolLib.prependPath(path.join(extractRoot, 'shellcheck-stable'));
};

/**
 * @private
 */
const installForMac = async () => {
    await taskLib
        .tool('brew')
        .arg('install')
        .arg('shellcheck')
        .exec();
};

/**
 * @private
 */
const installForWindows = async () => {
    const downloadUrl = `${shellCheckBinaryUrlBase}/shellcheck-stable.exe`;
    await toolLib.downloadTool(downloadUrl);
};

/**
 * Installs ShellCheck
 */
export const installShellCheck = async () => {
    const operatingSystem = taskLib.osType().toLowerCase();
    if (operatingSystem === 'linux') {
        await installForLinux();
    } else if (operatingSystem === 'darwin') {
        await installForMac();
    } else if (operatingSystem === 'windows_nt') {
        await installForWindows();
    } else {
        throw new Error(`Unsupported Operating System: ${operatingSystem}`);
    }
};
