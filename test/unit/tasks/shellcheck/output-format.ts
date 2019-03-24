'use strict';

import chai = require('chai');
import outputFormat = require('../../../../src/tasks/shellcheck/output-format');

const assert = chai.assert;

suite('OutputFormat:', () => {
    test('Should have the correct value for checkstyle', () => {
        assert.deepEqual(outputFormat.checkstyle, 'checkstyle');
    });

    test('Should have the correct value for gcc', () => {
        assert.deepEqual(outputFormat.gcc, 'gcc');
    });

    test('Should have the correct value for json', () => {
        assert.deepEqual(outputFormat.json, 'json');
    });

    test('Should have the correct value for tty', () => {
        assert.deepEqual(outputFormat.tty, 'tty');
    });
});
