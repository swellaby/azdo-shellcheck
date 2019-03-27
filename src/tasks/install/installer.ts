'use strict';

import os = require('os');
import path = require('path');
import taskLib = require('azure-pipelines-task-lib');
import toolLib = require('azure-pipelines-tool-lib');
import toolRunner = require('azure-pipelines-task-lib/toolrunner');

import ShellCheckVersion = require('./shellcheck-version');

const shellCheckBinaryUrlBase = 'https://shellcheck.storage.googleapis.com';

/**
 * @private
 */
const installForLinux = async (version: string) => {
    const architecture = os.arch();
    let tarballName;
    if (architecture === 'x64') {
        tarballName = `shellcheck-${version}.linux.x86_64.tar.xz`;
    } else if (architecture === 'arm64') {
        tarballName = `shellcheck-${version}.linux.armv6hf.tar.xz`;
    } else {
        throw new Error(`Unsupported architecture ${architecture}`);
    }

    const downloadUrl = `${shellCheckBinaryUrlBase}/${tarballName}`;
    const tarballLocation = await toolLib.downloadTool(downloadUrl);
    // The ShellCheck binary tarballs are not gzip compressed. The toolLib.extractTar
    // function always adds the 'z' tar option which would always fail for ShellCheck.
    //const extractRoot = await toolLib.extractTar(tarballLocation);
    const extractRoot = path.join(taskLib.getVariable('Agent.TempDirectory'), `shellcheck-${version}`);
    await taskLib.mkdirP(extractRoot);
    await taskLib.tool('tar').arg(['xC', extractRoot, '-f', tarballLocation]).exec();

    toolLib.prependPath(path.join(extractRoot, `shellcheck-${version}`));
};

/**
 * @private
 */
const installForMac = async (version: string) => {
    if (version !== ShellCheckVersion.stable) {
        taskLib.debug(`ShellCheck is installed with Homebrew on Mac. Cannot yet install custom version: ${version}`);
    }

    await taskLib
        .tool('brew')
        .arg('install')
        .arg('shellcheck')
        .exec(<toolRunner.IExecOptions>{ silent: true });
};

/**
 * @private
 */
const installForWindows = async (version: string) => {
    const downloadUrl = `${shellCheckBinaryUrlBase}/shellcheck-${version}.exe`;
    const downloadLocation = await toolLib.downloadTool(downloadUrl, 'shellcheck.exe');
    toolLib.prependPath(path.parse(downloadLocation).dir);
};

/**
 * Installs ShellCheck
 */
export const installShellCheck = async (version: string) => {
    const operatingSystem = os.type().toLowerCase();
    if (operatingSystem === 'linux') {
        await installForLinux(version);
    } else if (operatingSystem === 'darwin') {
        await installForMac(version);
    } else if (operatingSystem === 'windows_nt') {
        await installForWindows(version);
    } else {
        throw new Error(`Unsupported Operating System: ${operatingSystem}`);
    }
};