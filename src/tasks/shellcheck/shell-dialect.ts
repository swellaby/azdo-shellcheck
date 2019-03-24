'use strict';

/**
 * Enumerates the possible shell dialects.
 *
 * @enum {string}
 */
enum ShellDialect {
    default = 'default',
    bash = 'bash',
    dash = 'dash',
    ksh = 'ksh',
    sh = 'sh'
}

export = ShellDialect;
