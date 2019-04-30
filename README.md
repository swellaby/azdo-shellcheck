# azdo-shellcheck
[ShellCheck][shellcheck-repo] extension for Azure DevOps.  

Functional, but still in an early preview/beta.   

[![Version Badge][version-badge]][ext-url]
[![Installs Badge][installs-badge]][ext-url]
[![Rating Badge][rating-badge]][ext-url]
[![License Badge][license-badge]][license-url]

[![Linux CI Badge][linux-ci-badge]][linux-ci-url]
[![Mac CI Badge][mac-ci-badge]][mac-ci-url]
[![Windows CI Badge][windows-ci-badge]][windows-ci-url]  

[![Test Results Badge][tests-badge]][tests-url]
[![Coverage Badge][coverage-badge]][coverage-url]

## Contents
This extension adds two Azure Pipelines tasks to enable the execution of [ShellCheck][shellcheck-repo] in your Pipelines.

* Install ShellCheck - Use this task to install ShellCheck if your target agent does not already have ShellCheck installed (like the Hosted Agents)
* Run ShellCheck - Use this task to run a ShellCheck analysis

## Usage

### Install Task
The install ShellCheck task only has a single input:

* `version` - Specify the version of ShellCheck you want to install. 
  * Input type: picklist
  * Default value: `latest`
  * Allowed values: `latest`, `stable`, `0.6.0`, `0.5.0`, `0.4.7`, `0.4.6`

Here's the task in a visual designer based pipeline:
![][install-task-visual-designer-image]

And here's the snippet you'd use for a yaml based pipeline:
```yml
- task: swellaby.shellcheck.install-shellcheck.install-shellcheck@0
  displayName: 'Install ShellCheck'
  inputs:
    version: stable
```

### Run Task
The run ShellCheck task has several inputs that map to various options/arguments to pass to ShellCheck. Please note that some options are only available in newer versions of ShellCheck. 

Inputs:
* `targetFiles` - The files to run the ShellCheck scan against. Note that you can use glob/wildcard patterns (with directory recursion). For visual designer based pipelines you also have the option to use the file picker.
  * Input type: filePath
  * Default value: `**/*.sh`
* `followSourcedFiles` - Enable this option to follow `source` statements. When this input is set to true, the `-x`/`--external-sources` option will be passed to ShellCheck. Review the [ShellCheck documentation on this option][follow-sourced-files-option-doc-url] for more information.
  * Input type: boolean
  * Default value: `false`
* `checkSourcedFiles` - Enable this option to report issues found in sourced files. When this input is set to true, the `-a`/`--check-sourced` option will be passed to ShellCheck. Review the [ShellCheck documentation on this option][options-doc-url] for more information.
  * Input type: boolean
  * Default value: `false`
* `ignoredErrorCodes` - Use this option to ignore specific error codes. Place each error code that should be ignored on a separate line in your pipeline config. When specified, this input will pass the `-e` option to ShellCheck with the specified error codes. Review the [ShellCheck documentation on this option][error-codes-option-doc-url] for more information.
  * Input type: multiline
* `outputFormat` - This option specifies the type of output format to use. Review the [ShellCheck documentation on this option][output-format-option-doc-url] for more information.
  * Input type: picklist
  * Default value: `tty`
  * Allowed values: `tty`, `checkstyle`, `gcc`, `json`
* `shellDialect` - This option specifies the type of shell dialect to use. When this input is changed to something other than `default`, the `-s` option will be passed to ShellCheck with the specified dialect. Review the [ShellCheck documentation on this option][shell-dialect-option-doc-url] for more information.
  * Input type: picklist
  * Default value: `default`
  * Allowed values: `default`, `sh`, `bash`, `dash`, `ksh`
* `useRcFiles` - Disable this option to ignore all ShellCheck rc files. When this input is set to false, the `--norc` option will be passed to ShellCheck. Review the [ShellCheck documentation on this option][norc-files-option-doc-url] for more information.
  * Input type: boolean
  * Default value: `true`


Here's the task in a visual designer based pipeline:
![][run-task-visual-designer-image]

And here's the snippet you'd use for a yaml based pipeline:
```yml
- task: swellaby.shellcheck.shellcheck.shellcheck@0
  displayName: 'Run ShellCheck analysis'
  inputs:
    targetFiles: '**/*.sh'
    followSourcedFiles: true
    checkSourcedFiles: true
    ignoredErrorCodes: |
      SC2059
      SC2058
    outputFormat: checkstyle
    shellDialect: sh
    useRcFiles: false
```

## Feedback and Contributing
We'd love to hear from you! Have a request, question, or found a bug? Let us know:

- [Report a bug][create-bug]
- [Request an enhancement or new feature][create-feature-request]
- [Ask a question][create-question]

You can also add a [review][review-url], and/or give us a [star on GitHub][repo-url]!

Check out our [contributing guide][contributing] for detailed information on contributing to this extension.

## Icon Credits
The task and extension icons were sourced from the shellcheck.net icon in https://github.com/koalaman/shellcheck.net

[installs-badge]: https://img.shields.io/visual-studio-marketplace/azure-devops/installs/total/swellaby.shellcheck.svg?style=flat-square
[version-badge]: https://img.shields.io/vscode-marketplace/v/swellaby.shellcheck.svg?style=flat-square&label=marketplace
[rating-badge]: https://img.shields.io/vscode-marketplace/r/swellaby.shellcheck.svg?style=flat-square
[ext-url]: https://marketplace.visualstudio.com/items?itemName=swellaby.shellcheck
[license-url]: ./LICENSE
[license-badge]: https://img.shields.io/github/license/swellaby/azdo-shellcheck.svg?style=flat-square&color=blue
[downloads-badge]: https://img.shields.io/crates/d/rusty-hook.svg?style=flat-square
[linux-ci-badge]: https://img.shields.io/azure-devops/build/swellaby/opensource/66/master.svg?label=linux%20build&style=flat-square
[linux-ci-url]: https://dev.azure.com/swellaby/OpenSource/_build/latest?definitionId=66
[mac-ci-badge]: https://img.shields.io/azure-devops/build/swellaby/opensource/59/master.svg?label=mac%20build&style=flat-square
[mac-ci-url]: https://dev.azure.com/swellaby/OpenSource/_build/latest?definitionId=59
[windows-ci-badge]: https://img.shields.io/azure-devops/build/swellaby/opensource/60/master.svg?label=windows%20build&style=flat-square
[windows-ci-url]: https://dev.azure.com/swellaby/OpenSource/_build/latest?definitionId=60
[coverage-badge]: https://img.shields.io/azure-devops/coverage/swellaby/opensource/66/master.svg?style=flat-square
[coverage-url]: https://codecov.io/gh/swellaby/azdo-shellcheck/branch/master
[tests-badge]: https://img.shields.io/azure-devops/tests/swellaby/opensource/66/master.svg?label=unit%20tests&style=flat-square
[tests-url]: https://dev.azure.com/swellaby/OpenSource/_build/latest?definitionId=66&view=ms.vss-test-web.build-test-results-tab
[shellcheck-repo]: https://github.com/koalaman/shellcheck
[contributing]: https://github.com/swellaby/azdo-shellcheck/tree/master/.github/CONTRIBUTING.md
[review-url]: https://marketplace.visualstudio.com/items?itemName=swellaby.shellcheck&ssr=false#review-details
[create-issue]: https://github.com/swellaby/azdo-shellcheck/issues/new/choose
[create-bug]: https://github.com/swellaby/azdo-shellcheck/issues/new?template=01_BUG.md
[create-feature-request]: https://github.com/swellaby/azdo-shellcheck/issues/new?template=02_FEATURE_REQUEST.md
[create-question]: https://github.com/swellaby/azdo-shellcheck/issues/new?template=03_QUESTION.md
[repo-url]: https://github.com/swellaby/azdo-shellcheck
[install-task-visual-designer-image]: https://user-images.githubusercontent.com/13042488/56933572-09a25c80-6aae-11e9-9d06-012a6c34190c.png
[run-task-visual-designer-image]: https://user-images.githubusercontent.com/13042488/56933596-26d72b00-6aae-11e9-91d5-d40f6771f878.png
[follow-sourced-files-option-doc-url]: https://github.com/koalaman/shellcheck/wiki/Integration#decide-whether-you-want-to-follow-sourced-files-that-are-not-specified-as-input
[error-codes-option-doc-url]: https://github.com/koalaman/shellcheck/wiki/Ignore#ignoring-errors
[output-format-option-doc-url]: https://github.com/koalaman/shellcheck/blob/master/shellcheck.1.md#formats
[shell-dialect-option-doc-url]: https://github.com/koalaman/shellcheck/wiki/Integration#decide-whether-you-want-to-specify-a-shell-dialect
[norc-files-option-doc-url]: https://github.com/koalaman/shellcheck/blob/master/shellcheck.1.md#rc-files
[options-doc-url]: https://github.com/koalaman/shellcheck/blob/master/shellcheck.1.md#options
