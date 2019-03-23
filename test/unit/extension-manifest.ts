'use strict';

import chai = require('chai');
import semver = require('semver');
const extensionManifest = require('../../vss-extension.json');

const assert = chai.assert;

suite('ExtensionManifest', () => {
    suite('metadata', () => {
        test('Should have correct manifestVersion', () => {
            assert.deepEqual(extensionManifest.manifestVersion, 1);
        });

        test('Should have correct id', () => {
            assert.deepEqual(extensionManifest.id, 'shellcheck');
        });

        test('Should have correct name', () => {
            assert.deepEqual(extensionManifest.name, 'ShellCheck');
        });

        test('Should have valid version', () => {
            assert.isNotNull(semver.valid(extensionManifest.version));
        });

        test('Should have correct publisher', () => {
            assert.deepEqual(extensionManifest.publisher, 'Swellaby');
        });

        test('Should have correct description', () => {
            assert.deepEqual(extensionManifest.description, 'ShellCheck Extension');
        });

        test('Should be public', () => {
            assert.isTrue(extensionManifest.public);
        });

        test('Should have correct tags', () => {
            const tags = extensionManifest.tags;
            assert.deepEqual(tags.length, 2);
            assert.isTrue(tags.includes('shell'));
            assert.isTrue(tags.includes('shellcheck'));
        });

        test('Should have correct targets', () => {
            const targets = extensionManifest.targets;
            assert.deepEqual(targets.length, 1);
            assert.deepEqual(targets[0].id, 'Microsoft.VisualStudio.Services');
        });

        test('Should have correct categories', () => {
            const categories = extensionManifest.categories;
            assert.deepEqual(categories.length, 1);
            assert.isTrue(categories.includes('Azure Pipelines'));
        });

        test('Should have correct scopes', () => {
            const scopes = extensionManifest.scopes;
            assert.deepEqual(scopes.length, 2);
            assert.isTrue(scopes.includes('vso.extension'));
            assert.isTrue(scopes.includes('vso.profile'));
        });

        test('Should have correct gallery-flags', () => {
            const galleryFlags = extensionManifest['gallery-flags'];
            assert.deepEqual(galleryFlags.length, 2);
            assert.isTrue(galleryFlags.includes('Preview'));
            assert.isTrue(galleryFlags.includes('Public'));
        });

        // test('Should have correct helpMarkDown', () => {
        //     const expected = '[More Information](https://github.com/swellaby/azdo-shellcheck)';
        //     assert.deepEqual(extensionManifest.helpMarkDown, expected);
        // });

        // test('Should have correct version structure', () => {
        //     const version = extensionManifest.version;
        //     assert.isObject(version);
        //     assert.isNumber(version.Major);
        //     assert.isNumber(version.Minor);
        //     assert.isNumber(version.Patch);
        // });

        // test('Should have correct instanceNameFormat', () => {
        //     assert.deepEqual(extensionManifest.instanceNameFormat, 'Run ShellCheck');
        // });
    });

    suite('marketplace presentation', () => {
        test('Should have correct branding', () => {
            const branding = extensionManifest.branding;
            assert.deepEqual(branding.color, 'rgb(44, 62, 80)');
            assert.deepEqual(branding.theme, 'dark');
        });

        test('Should have correct icons', () => {
            const icons = extensionManifest.icons;
            assert.deepEqual(icons.default, 'images/extension-icon.png');
        });

        test('Should have correct content paths', () => {
            const content = extensionManifest.content;
            assert.deepEqual(content.details.path, 'README.md');
            assert.deepEqual(content.license.path, 'LICENSE');
        });

        test('Should have correct links', () => {
            const links = extensionManifest.links;
            assert.deepEqual(links.getstarted.uri, 'https://github.com/swellaby/azdo-shellcheck');
            assert.deepEqual(links.support.uri, 'https://github.com/swellaby/azdo-shellcheck/issues/new/choose');
            assert.deepEqual(links.license.uri, 'https://github.com/swellaby/azdo-shellcheck/blob/master/LICENSE');
        });

        test('Should have correct repository information', () => {
            const repository = extensionManifest.repository;
            assert.deepEqual(repository.type, 'git');
            assert.deepEqual(repository.uri, 'https://github.com/swellaby/azdo-shellcheck');
        });
    });

    suite('packaging', () => {
        test('Should have correct files', () => {
            const files = extensionManifest.files;
            assert.deepEqual(files.length, 2);
            assert.deepEqual(files[0].path, '.publish');
            assert.isUndefined(files[0].addressable);
            assert.deepEqual(files[1].path, 'images');
            assert.deepEqual(files[1].addressable, true);
        });

        test('Should have correct contributions', () => {
            const contributions = extensionManifest.contributions;
            const shellCheckTaskContribution = contributions[0];
            assert.deepEqual(shellCheckTaskContribution.id, 'shellcheck');
            assert.deepEqual(shellCheckTaskContribution.description, 'Pipeline task to run ShellCheck');
            assert.deepEqual(shellCheckTaskContribution.type, 'ms.vss-distributed-task.task');
            assert.deepEqual(shellCheckTaskContribution.targets.length, 1);
            assert.deepEqual(shellCheckTaskContribution.targets[0], 'ms.vss-distributed-task.tasks');
            assert.deepEqual(shellCheckTaskContribution.properties.name, '.publish/tasks/shellcheck');
        });
    });
});
