'use strict';

import chai = require('chai');
import fs = require('fs');
import got = require('got');
import path = require('path');

const assert = chai.assert;

const getTaskVersion = (taskDirectoryName: string) => {
    const taskManifestPath = path.join(__dirname, '..', '..', 'src', 'tasks', taskDirectoryName, 'task.json');
    return JSON.parse(fs.readFileSync(taskManifestPath, { encoding: 'utf-8' })).version;
};

const getExpectedInstallTaskVersion = () => getTaskVersion('install');
const getExpectedShellCheckTaskVersion = () => getTaskVersion('shellcheck');

const buildAzureDevOpsRestApiBaseUrl = (organization: string, project: string) => `https://dev.azure.com/${organization}/${project}/_apis`;

const getAzureDevOpsApiHeaders = () => {
    const pat = process.env.AZURE_DEVOPS_PAT;
    const auth = Buffer.from(`:${pat}`).toString('base64');
    return {
        Authorization: `basic ${auth}`
    };
};

const getBuild = async (organization: string, project: string, buildId: number) => {
    const url = `${buildAzureDevOpsRestApiBaseUrl(organization, project)}/build/builds/${buildId}?api-version=5.0`;
    const result = await got.get(url, { json: true });
    return result.body;
};

const waitForBuildToFinish = async (organization: string, project: string, buildId: number) => {
    const build = await getBuild(organization, project, buildId);
    if (build.status === 'completed') {
        return build;

    } else {
        await new Promise((resolve) => {
            // tslint:disable-next-line:no-string-based-set-timeout
            setTimeout(resolve, 14000);
        });
        return await waitForBuildToFinish(organization, project, buildId);
    }
};

const queueAzurePipelinesBuild = (organization: string, project: string, definitionId: number) => {
    const options = <got.GotJSONOptions>{
        json: true,
        body: {
            definition: { id: definitionId }
        },
        headers: getAzureDevOpsApiHeaders()
    };
    const url = `${buildAzureDevOpsRestApiBaseUrl(organization, project)}/build/builds?api-version=5.0`;
    return got.post(url, options);
};

const runAzurePipelinesBuild = async (organization: string, project: string, definitionId: number) => {
    const result = await queueAzurePipelinesBuild(organization, project, definitionId);
    const buildId = result.body.id;
    return await waitForBuildToFinish(organization, project, buildId);
};

const getAzurePipelinesTaskVersion = async (organization: string, taskId: string) => {
    const options = <got.GotJSONOptions>{
        json: true,
        headers: getAzureDevOpsApiHeaders()
    };
    const url = `https://dev.azure.com/${organization}/_apis/distributedtask/tasks/${taskId}`;
    const result = await got.get(url, options);
    return result.body.value[0].version;
};

const validateTaskVersions = async (organization: string) => {
    const installTaskId = '3f74db91-b37c-4602-bb92-2658c6d136f2';
    const expectedInstallTaskVersion = getExpectedInstallTaskVersion();
    const actualInstallTaskVersion = await getAzurePipelinesTaskVersion(organization, installTaskId);
    assert.deepEqual(actualInstallTaskVersion.major, expectedInstallTaskVersion.Major);
    assert.deepEqual(actualInstallTaskVersion.minor, expectedInstallTaskVersion.Minor);
    assert.deepEqual(actualInstallTaskVersion.patch, expectedInstallTaskVersion.Patch);

    const shellCheckTaskId = '7d357064-b610-44c0-b52c-734fdf665a7c';
    const expectedShellCheckTaskVersion = getExpectedShellCheckTaskVersion();
    const actualShellCheckTaskVersion = await getAzurePipelinesTaskVersion(organization, shellCheckTaskId);
    assert.deepEqual(actualShellCheckTaskVersion.major, expectedShellCheckTaskVersion.Major);
    assert.deepEqual(actualShellCheckTaskVersion.minor, expectedShellCheckTaskVersion.Minor);
    assert.deepEqual(actualShellCheckTaskVersion.patch, expectedShellCheckTaskVersion.Patch);
};

const getBuildDefinitionIdsForExtensionValidation = () => {
    if (process.env.USE_AZURE_DEVOPS_PROD_ORG) {
        return {
            macFailing: 72,
            macPassing: 73,
            linuxFailing: 70,
            linuxPassing: 71,
            windowsFailing: 74,
            windowsPassing: 75
        };
    }

    return {
        macFailing: 3,
        macPassing: 4,
        linuxFailing: 1,
        linuxPassing: 2,
        windowsFailing: 5,
        windowsPassing: 6
    };
};

export = {
    runAzurePipelinesBuild,
    getExpectedInstallTaskVersion,
    getExpectedShellCheckTaskVersion,
    getAzurePipelinesTaskVersion,
    validateTaskVersions,
    getBuildDefinitionIdsForExtensionValidation,
    failedResult: 'failed',
    succeededResult: 'succeeded',
    queueAzurePipelinesBuild
};
