# tslint-folders

use tslint to check for invalid imports between packages and folders in your project.

automatic validation and documentation of package architecture.

## usage

The tslint rules are enabled and configured in `tslint.json`.

See [tslint.json](tslint.json) or the [unit tests](./test/rules/) for examples.

### building and testing

| command    | description                                                             |
| ---------- | ----------------------------------------------------------------------- |
| yarn build | Builds the rules to the 'dist' folder, from where they can be executed. |
| yarn lint  | Lints the source code of the rules.                                     |
| yarn test  | Tests the rules against spec files (\*.lint)                            |

## Summary of the Custom Rules

here is a summary of the current custom rules.

| Rule ID                                 | Description                                                                                                                                                           |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| tslint-folders-disabled-test            | Detect a disabled unit test, test suite or integration test.                                                                                                          |
| tslint-folders-from-disallowed-folders  | Detect an import from a non-standard folder like node_modules                                                                                                         |
| tslint-folders-imports-between-packages | Detect an import from a 'higher level' package: from example, import from an application 'shell' package when inside an 'area' package. This is the main custom rule. |
| tslint-folders-imports-from-self        | Detect an import from _this_ package (should use relative path, not the package name)                                                                                 |
| tslint-folders-test-with-breakpoint     | Detect when an integration test has a break point like `browser.debug()`                                                                                              |

## approach taken

All of the rules use the same prefix `tslint-folders-`.

To make it clear to developers that a _custom_ rule is involved, all messages from the rules also include the rule id.

Some of these rules could be replaced by standard tslint configuration.
However, having custom rules gives clearer messages to help the developer to know what to fix (or what to disable for that piece of code).

Some rules are not related to 'folders' but are included as they seem useful.

For details, please see the [unit tests](./test/rules/)

## unit tests

The unit tests for the rule `tslint-folders-imports-between-packages` are [here](./test/rules/tslint-folders-imports-between-packages).

The unit tests use test data to check the package boundaries of a fairly typical website.

The matching configuration can be seen in [tslint.json](tslint.json)

### test data - packages

The test data is based around a website that uses multiple packages:

Example validation: 'shell' should be able to import from 'todo-area', but not the other way around (shell is at a higher level of abstraction, and also want to avoid 2-way dependencies).

| Package name | Description                                                                                                                               |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| shell        | The application shell - this is the top level package, and it can import from any other package.                                          |
| todo-area    | A 'todo app' area of the website, that is hosted within the shell. It should not import from the shell or from other 'area' packages.     |
| todo-contact | A 'contact info' area of the website, that is hosted within the shell. It should not import from the shell or from other 'area' packages. |
| grid-package | A UI grid that is used by area packages. It should not import any other recognised packages.                                              |
| utils        | A 'utils' package used by the shell and area packages. It should not import any other recognised packages.                                |

### test data - packages with sub-folders

tslint-folders can also validate imports between sub-folders of a package.

The test data 'todo-area' package is configured with fairly typical sub-folders such as 'components' and 'models'. [tslint.json](tslint.json) has been configured to check the imports between these folders.

Example validation: 'components' should be able to import from 'models', but not the other way around (components is at a higher level of abstraction, and also want to avoid 2-way dependencies).

| Sub-folder name | Description                                                                             |
| --------------- | --------------------------------------------------------------------------------------- |
| components      | Top-level folder of UI components. Can import from any of the other recognised folders. |
| viewmodels      | view models folder of UI components. Can only import from models or utils.              |
| models          | models folder of UI components. Can only import from utils.                             |
| utils           | A 'utils' folder. It should not import any other recognised folders.                    |
