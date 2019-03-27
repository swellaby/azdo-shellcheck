'use strict';

import chai = require('chai');
import ShellCheckVersion = require('../../../../src/tasks/install/shellcheck-version');

const assert = chai.assert;

suite('ShellCheckVersion:', () => {
    test('Should have the correct value for latest', () => {
        assert.deepEqual(ShellCheckVersion.latest, 'latest');
    });

    test('Should have the correct value for stable', () => {
        assert.deepEqual(ShellCheckVersion.stable, 'stable');
    });

    test('Should have the correct value for 0.6.0', () => {
        const version = '0.6.0';
        assert.deepEqual(ShellCheckVersion[version], `v${version}`);
    });

    test('Should have the correct value for 0.5.0', () => {
        const version = '0.5.0';
        assert.deepEqual(ShellCheckVersion[version], `v${version}`);
    });

    test('Should have the correct value for 0.4.7', () => {
        const version = '0.4.7';
        assert.deepEqual(ShellCheckVersion[version], `v${version}`);
    });

    test('Should have the correct value for 0.4.6', () => {
        const version = '0.4.6';
        assert.deepEqual(ShellCheckVersion[version], `v${version}`);
    });
});
