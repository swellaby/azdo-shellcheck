'use strict';

import chai = require('chai');
import shellDialect = require('../../../../src/tasks/shellcheck/shell-dialect');

const assert = chai.assert;

suite('ShellDialect:', () => {
    test('Should have the correct value for default', () => {
        assert.deepEqual(shellDialect.default, 'default');
    });

    test('Should have the correct value for bash', () => {
        assert.deepEqual(shellDialect.bash, 'bash');
    });

    test('Should have the correct value for dash', () => {
        assert.deepEqual(shellDialect.dash, 'dash');
    });

    test('Should have the correct value for ksh', () => {
        assert.deepEqual(shellDialect.ksh, 'ksh');
    });

    test('Should have the correct value for sh', () => {
        assert.deepEqual(shellDialect.sh, 'sh');
    });
});
