'use strict';

import chai = require('chai');
const taskManifest = require('../../../../src/tasks/install/task.json');

const assert = chai.assert;

suite('TaskManifest', () => {
    suite('metadata', () => {
        test('Should have correct taskId', () => {
            assert.deepEqual(taskManifest.id, '3f74db91-b37c-4602-bb92-2658c6d136f2');
        });

        test('Should have correct name', () => {
            assert.deepEqual(taskManifest.name, 'install-shellcheck');
        });

        test('Should have correct friendlyName', () => {
            assert.deepEqual(taskManifest.friendlyName, 'Install ShellCheck');
        });

        test('Should have correct description', () => {
            assert.deepEqual(taskManifest.description, 'Installs Specified ShellCheck Version');
        });

        test('Should have correct category', () => {
            assert.deepEqual(taskManifest.category, 'Utility');
        });

        test('Should have correct author', () => {
            assert.deepEqual(taskManifest.author, 'Swellaby');
        });

        test('Should have correct helpMarkDown', () => {
            const expected = '[More Information](https://github.com/swellaby/azdo-shellcheck)';
            assert.deepEqual(taskManifest.helpMarkDown, expected);
        });

        test('Should have correct version structure', () => {
            const version = taskManifest.version;
            assert.isObject(version);
            assert.isNumber(version.Major);
            assert.isNumber(version.Minor);
            assert.isNumber(version.Patch);
        });

        test('Should have correct instanceNameFormat', () => {
            assert.deepEqual(taskManifest.instanceNameFormat, 'Install ShellCheck');
        });
    });

    suite('inputs', () => {
        const inputs = taskManifest.inputs;

        test('Should have correct number of inputs', () => {
            assert.deepEqual(1, inputs.length);
        });

        test('Should have correct version input configuration', () => {
            const input = inputs[0];
            assert.deepEqual(input.name, 'version');
            assert.deepEqual(input.type, 'picklist');
            assert.deepEqual(input.label, 'ShellCheck Version');
            assert.deepEqual(input.defaultValue, 'latest');
            assert.isTrue(input.required);
            assert.deepEqual(input.helpMarkDown, 'Specify the version of ShellCheck to use. Note custom version installation is limited on MacOS Agents.');
            const options = input.options;
            const optionsKeys = Object.keys(options);
            assert.deepEqual(optionsKeys.length, 6);
            assert.deepEqual(options.latest, 'latest');
            assert.deepEqual(optionsKeys[0], 'latest');
            assert.deepEqual(options.stable, 'stable');
            assert.deepEqual(optionsKeys[1], 'stable');
            assert.deepEqual(options.zeroSixZero, '0.6.0');
            assert.deepEqual(optionsKeys[2], 'zeroSixZero');
            assert.deepEqual(options.zeroFiveZero, '0.5.0');
            assert.deepEqual(optionsKeys[3], 'zeroFiveZero');
            assert.deepEqual(options.zeroFourSeven, '0.4.7');
            assert.deepEqual(optionsKeys[4], 'zeroFourSeven');
            assert.deepEqual(options.zeroFourSix, '0.4.6');
            assert.deepEqual(optionsKeys[5], 'zeroFourSix');
        });
    });

    suite('execution', () => {
        const execution = taskManifest.execution;

        test('Should have correct Node target', () => {
            assert.deepEqual(execution.Node.target, 'runner.js');
        });
    });
});
