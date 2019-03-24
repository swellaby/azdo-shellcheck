'use strict';

import OutputFormat = require('./output-format');
import ShellDialect = require('./shell-dialect');

interface IInputs {
    scriptFiles: string[];
    targetFiles: string;
    followSourcedFiles: boolean;
    checkSourcedFiles: boolean;
    ignoredErrorCodes: string[];
    outputFormat: OutputFormat;
    shellDialect: ShellDialect;
    useRcFiles: boolean;
}

export = IInputs;
