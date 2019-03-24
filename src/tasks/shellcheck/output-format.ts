'use strict';

/**
 * Enumerates the possible ShellCheck Output Formats.
 *
 * @enum {string}
 */
enum OutputFormat {
    checkstyle = 'checkstyle',
    gcc = 'gcc',
    json = 'json',
    tty = 'tty'
}

export = OutputFormat;
