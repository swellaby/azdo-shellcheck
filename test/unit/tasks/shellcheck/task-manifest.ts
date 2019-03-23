'use strict';

import chai = require('chai');
const taskManifest = require('../../../../src/tasks/shellcheck/task.json');

const assert = chai.assert;

suite('TaskManifest', () => {
    suite('metadata', () => {
        test('Should have correct taskId', () => {
            assert.deepEqual(taskManifest.id, '7d357064-b610-44c0-b52c-734fdf665a7c');
        });

        test('Should have correct name', () => {
            assert.deepEqual(taskManifest.name, 'shellcheck');
        });

        test('Should have correct friendlyName', () => {
            assert.deepEqual(taskManifest.friendlyName, 'ShellCheck');
        });

        test('Should have correct description', () => {
            assert.deepEqual(taskManifest.description, 'Run ShellCheck');
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
            assert.deepEqual(taskManifest.instanceNameFormat, 'Run ShellCheck');
        });
    });

    suite('inputs', () => {
        const inputs = taskManifest.inputs;

        test('Should have correct number of inputs', () => {
            assert.deepEqual(3, inputs.length);
        });

        test('Should have correct targetFiles input configuration', () => {
            const input = inputs[0];
            assert.deepEqual(input.name, 'targetFiles');
            assert.deepEqual(input.type, 'filePath');
            assert.deepEqual(input.label, 'Target Files');
            assert.deepEqual(input.defaultValue, '**/*.sh');
            assert.isTrue(input.required);
            assert.deepEqual(input.helpMarkDown, 'The script files to check. Yes you can use globs!');
        });

        test('Should have correct followSourcedFiles input configuration', () => {
            const input = inputs[1];
            assert.deepEqual(input.name, 'followSourcedFiles');
            assert.deepEqual(input.type, 'boolean');
            assert.deepEqual(input.label, 'Follow Sourced Files');
            assert.deepEqual(input.defaultValue, false);
            assert.isTrue(input.required);
            const expectedHelpText = 'Enable this to follow all sourced includes. See the [docs]' +
                '(https://github.com/koalaman/shellcheck/wiki/Integration#decide-whether-you-want-to-follow-sourced-files-that-are-not-specified-as-input) for more information';
            assert.deepEqual(input.helpMarkDown, expectedHelpText);
        });

        test('Should have correct ignoredErrorCodes input configuration', () => {
            const input = inputs[2];
            assert.deepEqual(input.name, 'ignoredErrorCodes');
            assert.deepEqual(input.type, 'multiLine');
            assert.deepEqual(input.label, 'Error Codes To Ignore');
            assert.deepEqual(input.defaultValue, '');
            assert.isFalse(input.required);
            const expectedHelpText = 'List the ShellCheck error codes you want to ignore (i.e. SC2059)' +
                ', with one error code per line. See the [docs](https://github.com/koalaman/shellcheck/wiki/Ignore#ignoring-errors) for more information';
            assert.deepEqual(input.helpMarkDown, expectedHelpText);
            assert.deepEqual(input.properties.rows, '3');
            assert.deepEqual(input.properties.maxLength, '1500');
        });
    });

    suite('execution', () => {
        const execution = taskManifest.execution;

        test('Should have correct Node target', () => {
            assert.deepEqual(execution.Node.target, 'runner.js');
        });
    });
});
