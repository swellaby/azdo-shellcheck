# Contributing
All contributions are welcomed and appreciated! 

## Opening Issues
Need to open an issue? Click [here][create-issue] or use one of the below links:

- [Report a bug][create-bug]
- [Request an enhancement or new feature][create-feature-request]
- [Ask a question][create-question]

## Developing
All that is needed to work with this repo is [Node][node] and your favorite editor or IDE, although we recommend [VS Code][vscode].


### Building
To build and/or work on this project:

Clone the repo, change into the directory where you cloned the repo, and then run the dev setup script.

```sh     
git clone https://github.com/swellaby/azdo-shellcheck.git
cd azdo-shellcheck
npm run dev:setup
```  

### Submitting Changes
Swellaby members should create a branch within the repository, make changes there, and then open a Pull Request. 

Outside contributors should fork the repository, make changes in the fork, and then open a Pull Request. Check out the [GitHub Forking Projects Guide][fork-guide-url] for more info.

#### PR Validation
When you create a Pull Request to merge changes, the PR checks in Azure Pipelines will be triggered automatically to validate the changes on Mac, Linux, and Windows.

All of the PR checks must pass before the PR can be merged.

### git hooks
This repo utilizes the [husky][husky-url] module for the [git pre-commit hook][git-hook-url]. As such, when you run a `git commit`, the pre-commit hook will run a script to ensure the linter still passes, that all unit tests still pass, and that code coverage is still at 100%. If the script fails your commit will be rejected, and you will need to fix the issue(s) before attempting to commit again.  

You can optionally skip this hook by including the `-n` switch (i.e. `git commit -n -m "..."`) if you are only trying to commit non-code content, like a markdown or package.json file.

### Resetting workspace
You may occasionally want and/or need to reset your workspace, especially if you haven't updated your local workspace in a while. To do so, simply run the reset script. This will clean up all generated directories and content, and will also update your local dependencies.

```sh
npm run dev:reset
```

### Tests
We use [Mocha][mocha-url] and [Sinon][sinon-url] to test and validate, and the tests are written using [Mocha's TDD interface][mocha-tdd-url].  

There are suites of [unit tests][unit-tests] that validate individual functions in complete isolation, and there are also [component tests][component-tests] that validate multiple components of the module in conjunction. We also have functional tests (see [below section][functional-test-section] for more info).

The tests will be run as part of the npm `build` script and on a git commit, but there are npm scripts you can use to run the test suites directly. The test results will be displayed in the console.

Run the unit tests:
```sh
npm run test:unit
```  

Run the component tests:
```sh
npm run test:component
```

You must write corresponding unit and component tests for any code you add or modify, and all tests must pass before those changes can be merged back to the master branch.

#### Functional tests
This repo also contains the [functional tests][functional-tests] for the Azure DevOps ShellCheck Extension. These are primarily only used from the release pipeline that deploys the extension to the [Marketplace][vs-marketplace]. 

These tests trigger Azure Pipelines builds that utilize the ShellCheck tasks to validate the published tasks are functioning correctly. Those pipelines are defined in our [ShellCheck Tests Repo][shellcheck-tests-repo] which also contains the sample shell scripts that are used for the ShellCheck scans.

The functional tests can be invoked via:
```sh
npm run test:functional
```

However, you most likely will never need to run these functional tests from your local workspace. 

### Code coverage
Code coverage is generated, and enforced using [Istanbuljs/nyc][nyc-url]. The unit test suite has 100% coverage of the application source code, and similarly the component test suite also has 100% coverage. We will not accept any changes that drop the code coverage below 100%.

The tests will be run as part of the npm `build` script and on a git commit, but there are also several coverage related `npm scripts` that you can run to generate and/or view the coverage details.  

Generate latest coverage for the unit tests:
```sh
npm run coverage
```  

Open the detailed HTML coverage report for the unit tests:
```sh
npm run coverage:open
```

Generate latest coverage for the component tests:
```sh
npm run coverage:component
```  

Open the detailed HTML coverage report for the component tests:
```sh
npm run coverage:component:open
```

### Linting
This repo uses [tslint][tslint-url] and [eslint][eslint-url] for respectively linting the TypeScript and JavaScript code. The tslint configuration can be found in the [tslint.json][tslint-config-url] file and the eslint configuration can be found in the [.eslintrc.js][eslint-config-url] file.

Both tslint and eslint are automatically run when you run the npm `build` script and when you make a commit. Additionally you can run also run the linters via their corresponding npm script.

For example to run both eslint and tslint:
```sh
npm run lint
```  

Or to just run [tslint][tslint-url]:
```sh
npm run tslint
```  

Or to just run [eslint][eslint-url]:
```sh
npm run eslint
```  

### Versioning
All of the manifest files associated with this extension (the task manifests, the extension manifest, and the package manifest) have their versions automatically incremented (patch version is bumped) by the relevant scripts and/or release process. As such there is no need to manually update the versions in most circumstances. 

When you should manually update a manifest version:
1) If you add a new option or feature to a task, increase the `minor` version in the associated task manifest (`task.json`)
2) If a breaking change is introduced to a task (such as changing input names) then increase the `major` version in the associated task manifest (`task.json`)
3) If a new contribution is added to the extension (such as a new task), then increase the `minor` version in the extension manifest (`vss-extension.json`)

### Running the tasks
While working on the tasks, you may want to test your changes in a live Azure Pipeline (a "localhost" equivalent) and there are a handful of npm scripts included in this repo to simplify that process.

First, you'll want to determine which Azure DevOps organization you'll use and make sure you have [created a Personal Access Token (PAT)][azdo-pat-url] with permissions to upload tasks. Then, run the `login` script and enter that organization and PAT when prompted:
```sh
npm run tfx:login
```

Once you've done that, you can run (and re-run) the below scripts to upload your tasks as needed:

Upload the `install` task:
```sh
npm run task:install:upload
```

Upload the `shellcheck` task:
```sh
npm run task:shellcheck:upload
```

Upload them both:
Upload the `shellcheck` task:
```sh
npm run tasks:upload
```

If you want to remove the tasks...

Remove the `install` task:
```sh
npm run task:install:delete
```

Remove the `shellcheck` task:
```sh
npm run task:shellcheck:delete
```

## Deployment
The release process for the Azure DevOps ShellCheck extension is fully automated.

As soon as a change is merged into the Master branch, the [continuous integration pipeline][ci-pipeline-url] will start automatically. If the CI job is successful then the changes will proceed along to our [release pipeline][cd-pipeline-url]. 

Our release pipeline will perform a variety of validation steps, including functional tests on Mac, Linux, and Windows. Once all the automated quality gates pass, and approval has been given by a maintainer, the updates will be published to the Marketplace

![](https://user-images.githubusercontent.com/13042488/56629204-3966e580-6612-11e9-875d-4ca30d54be67.png)

[Back to Top][top]


[top]: CONTRIBUTING.md#contributing
[create-issue]: https://github.com/swellaby/azdo-shellcheck/issues/new/choose
[create-bug]: https://github.com/swellaby/azdo-shellcheck/issues/new?template=01_BUG.md
[create-feature-request]: https://github.com/swellaby/azdo-shellcheck/issues/new?template=02_FEATURE_REQUEST.md
[create-question]: https://github.com/swellaby/azdo-shellcheck/issues/new?template=03_QUESTION.md
[vscode]: https://code.visualstudio.com/
[node]: https://nodejs.org/en/download/
[vs-marketplace]: https://marketplace.visualstudio.com/azuredevops
[fork-guide-url]: https://guides.github.com/activities/forking/
[ci-pipeline-url]: https://dev.azure.com/swellaby/OpenSource/_build?definitionId=66
[cd-pipeline-url]: https://dev.azure.com/swellaby/OpenSource/_release?definitionId=11&view=all
[unit-tests]: ../test/unit
[component-tests]: ../test/component
[functional-tests]: ../test/functional
[functional-test-section]: CONTRIBUTING.md#functional-tests
[shellcheck-tests-repo]: https://github.com/swellaby/shellcheck-tests
[codecov project]: https://codecov.io/gh/swellaby/azdo-shellcheck
[nyc-url]: https://www.npmjs.com/package/nyc
[husky-url]: https://www.npmjs.com/package/husky
[git-hook-url]: https://git-scm.com/docs/githooks#_pre_commit
[eslint-url]: https://eslint.org/
[eslint-config-url]: ../.eslintrc.js
[tslint-url]: https://palantir.github.io/tslint/
[tslint-config-url]: ../tslint.json
[mocha-url]: https://mochajs.org/
[mocha-tdd-url]: https://mochajs.org/#tdd
[sinon-url]: sinonjs.org/
[azdo-pat-url]: https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops#create-personal-access-tokens-to-authenticate-access
