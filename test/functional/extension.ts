'use strict';

import chai = require('chai');
import utils = require('./utils');

const assert = chai.assert;

suite('Extension', () => {
    const organization = process.env.AZURE_DEVOPS_EXTENSION_VALIDATION_ORGANIZATION || 'swellaby-azp-extension-validation';
    const project = process.env.AZURE_DEVOPS_EXTENSION_VALIDATION_PROJECT || 'OpenSource';

    suiteSetup(async () => {
        await utils.validateTaskVersions(organization);
    });

    test('Pipeline should fail on MacOS when scripts do not pass ShellCheck scan', async () => {
        const definitionId = 1;
        const build = await utils.runAzurePipelinesBuild(organization, project, definitionId);
        assert.deepEqual(build.result, utils.failedResult);
    });

    test('Pipeline should fail on Linux when scripts do not pass ShellCheck scan', async () => {
        const definitionId = 2;
        const build = await utils.runAzurePipelinesBuild(organization, project, definitionId);
        assert.deepEqual(build.result, utils.failedResult);
    });

    test('Pipeline should fail on Windows when scripts do not pass ShellCheck scan', async () => {
        const definitionId = 3;
        const build = await utils.runAzurePipelinesBuild(organization, project, definitionId);
        assert.deepEqual(build.result, utils.failedResult);
    });

    test('Pipeline should succeed on MacOS when scripts do not pass ShellCheck scan', async () => {
        const definitionId = 4;
        const build = await utils.runAzurePipelinesBuild(organization, project, definitionId);
        assert.deepEqual(build.result, utils.succeededResult);
    });

    test('Pipeline should succeed on Linux when scripts do not pass ShellCheck scan', async () => {
        const definitionId = 5;
        const build = await utils.runAzurePipelinesBuild(organization, project, definitionId);
        assert.deepEqual(build.result, utils.succeededResult);
    });

    test('Pipeline should succeed on Windows when scripts do not pass ShellCheck scan', async () => {
        const definitionId = 6;
        const build = await utils.runAzurePipelinesBuild(organization, project, definitionId);
        assert.deepEqual(build.result, utils.succeededResult);
    });
});
