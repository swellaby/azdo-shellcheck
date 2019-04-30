'use strict';

import chai = require('chai');
const taskManifest = require('../../../../src/tasks/shellcheck/task.json');

const assert = chai.assert;

suite('ShellCheck TaskManifest', () => {
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
            assert.deepEqual(7, inputs.length);
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

        test('Should have correct checkSourcedFiles input configuration', () => {
            const input = inputs[2];
            assert.deepEqual(input.name, 'checkSourcedFiles');
            assert.deepEqual(input.type, 'boolean');
            assert.deepEqual(input.label, 'Check Sourced Files');
            assert.deepEqual(input.defaultValue, false);
            assert.isTrue(input.required);
            const expectedHelpText = 'Check sourced files. See the [docs](https://github.com/koalaman/shellcheck/blob/master/shellcheck.1.md#options) for more information';
            assert.deepEqual(input.helpMarkDown, expectedHelpText);
        });

        test('Should have correct ignoredErrorCodes input configuration', () => {
            const input = inputs[3];
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

        test('Should have correct outputFormat input configuration', () => {
            const input = inputs[4];
            assert.deepEqual(input.name, 'outputFormat');
            assert.deepEqual(input.type, 'picklist');
            assert.deepEqual(input.label, 'Output Format');
            assert.deepEqual(input.defaultValue, 'tty');
            assert.isTrue(input.required);
            const expectedHelpText = 'Specify the output format. See the [docs]' +
                '(https://github.com/koalaman/shellcheck/blob/master/shellcheck.1.md#formats) for more information';
            assert.deepEqual(input.helpMarkDown, expectedHelpText);
            const options = input.options;
            const optionsKeys = Object.keys(options);
            assert.deepEqual(optionsKeys.length, 4);
            assert.deepEqual(options.tty, 'tty (default)');
            assert.deepEqual(optionsKeys[0], 'tty');
            assert.deepEqual(options.checkstyle, 'checkstyle');
            assert.deepEqual(optionsKeys[1], 'checkstyle');
            assert.deepEqual(options.gcc, 'gcc');
            assert.deepEqual(optionsKeys[2], 'gcc');
            assert.deepEqual(options.json, 'json');
            assert.deepEqual(optionsKeys[3], 'json');
        });

        test('Should have correct shellDialect input configuration', () => {
            const input = inputs[5];
            assert.deepEqual(input.name, 'shellDialect');
            assert.deepEqual(input.type, 'picklist');
            assert.deepEqual(input.label, 'Shell Dialect');
            assert.deepEqual(input.defaultValue, 'default');
            assert.isTrue(input.required);
            const expectedHelpText = 'Specify the shell dialect. See the [docs]' +
                '(https://github.com/koalaman/shellcheck/wiki/Integration#decide-whether-you-want-to-specify-a-shell-dialect) for more information';
            assert.deepEqual(input.helpMarkDown, expectedHelpText);
            const options = input.options;
            const optionsKeys = Object.keys(options);
            assert.deepEqual(optionsKeys.length, 5);
            assert.deepEqual(options.default, 'default');
            assert.deepEqual(optionsKeys[0], 'default');
            assert.deepEqual(options.sh, 'sh');
            assert.deepEqual(optionsKeys[1], 'sh');
            assert.deepEqual(options.bash, 'bash');
            assert.deepEqual(optionsKeys[2], 'bash');
            assert.deepEqual(options.dash, 'dash');
            assert.deepEqual(optionsKeys[3], 'dash');
            assert.deepEqual(options.ksh, 'ksh');
            assert.deepEqual(optionsKeys[4], 'ksh');
        });

        test('Should have correct useRcFiles input configuration', () => {
            const input = inputs[6];
            assert.deepEqual(input.name, 'useRcFiles');
            assert.deepEqual(input.type, 'boolean');
            assert.deepEqual(input.label, 'Utilize shellcheckrc files');
            assert.deepEqual(input.defaultValue, true);
            assert.isTrue(input.required);
            const expectedHelpText = 'Look for and use .shellcheckrc files. See the ' +
                '[docs](https://github.com/koalaman/shellcheck/blob/master/shellcheck.1.md#rc-files) for more information';
            assert.deepEqual(input.helpMarkDown, expectedHelpText);
        });
    });

    suite('execution', () => {
        const execution = taskManifest.execution;

        test('Should have correct Node target', () => {
            assert.deepEqual(execution.Node.target, 'runner.js');
        });
    });
});
