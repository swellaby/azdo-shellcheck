---
name:  🐞 Bug Report
about: Report errors and problems with the Azure DevOps ShellCheck Extension

---

<!-- Fill in the below form so that we have the relevant details about the environment where the bug/error is occurring. -->
## Environment Details
* **ShellCheck Task**
    <!-- Check the box to indicate which of the ShellCheck Pipeline Tasks you are experiencing an issue with. -->
  * [ ] Install ShellCheck
    * Version: <!-- Enter the Install task version here if you are experiencing an issue with the Install task. -->
  * [ ] Run ShellCheck
      * Version: <!-- Enter the Run task version here if you are experiencing an issue with the Install task. -->
* **Agent Type**
    <!-- Check the box to indicate which Azure Pipelines Agent environment(s) where the error occurs. -->
  * [ ] Hosted Linux Agent
  * [ ] Hosted MacOS Agent
  * [ ] Hosted Windows Agent
  * [ ] Self-hosted/private Agent
* **Agent Tool Versions**
    <!-- Add the versions of the below items on the agent where you are seeing the bug. You may include multiple values (i.e. Node 8.x, 9.x) if you are seeing the error on multiple versions. -->
  * **Node.js Version**: 
  * **npm version**:

## Description
<!-- Provide a clear and concise description of the bug/problem you are experiencing. -->

## Log Output
<!-- Provide the log output of the ShellCheck task(s) from your pipeline with the error details. Below is an example of what that will look like: -->
```
```

<!-- 
```
##[section]Starting: Install ShellCheck
==============================================================================
Task         : Install ShellCheck
Description  : Installs Specified ShellCheck Version
Version      : 0.0.17
Author       : Swellaby
Help         : [More Information](https://github.com/swellaby/azdo-shellcheck)
==============================================================================
module.js:471
    throw err;
    ^

Error: Cannot find module 'semver'
    at Function.Module._resolveFilename (module.js:469:15)
    at Function.Module._load (module.js:417:25)
    at Module.require (module.js:497:17)
    at require (internal/module.js:20:19)
    at Object.<anonymous> (/home/vsts/work/_tasks/install-shellcheck_3f74db91-b37c-4602-bb92-2658c6d136f2/0.0.17/node_modules/azure-pipelines-task-lib/internal.js:10:14)
    at Module._compile (module.js:570:32)
    at Object.Module._extensions..js (module.js:579:10)
    at Module.load (module.js:487:32)
    at tryModuleLoad (module.js:446:12)
    at Function.Module._load (module.js:438:3)
##[error]Exit code 1 returned from process: file name '/home/vsts/agents/2.148.2/externals/node/bin/node', arguments '"/home/vsts/work/_tasks/install-shellcheck_3f74db91-b37c-4602-bb92-2658c6d136f2/0.0.17/runner.js"'.
##[section]Finishing: Install ShellCheck
```
-->
