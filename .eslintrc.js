'use strict';

module.exports = {
    extends: '@swellaby/eslint-config/lib/bundles/ts-node',
    'rules': {
        'no-unused-vars': [
            'error',
            {
                argsIgnorePattern: '^_'
            }
        ]
    }
};
