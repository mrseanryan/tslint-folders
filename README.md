# :file_folder: tslint-folders

Use tslint to check for invalid imports between packages and folders in your TypeScript project.

Automatic validation and documentation of package architecture.

## status - stable

tslint-folders is stable and in use every day in CI builds and on dev boxes (Linux, Mac, Windows) for at least one major product.

[![Travis](https://img.shields.io/travis/mrseanryan/tslint-folders.svg)](https://travis-ci.org/mrseanryan/tslint-folders)
[![Coveralls](https://img.shields.io/coveralls/mrseanryan/tslint-folders.svg)](https://coveralls.io/github/mrseanryan/tslint-folders)
[![Size](https://packagephobia.now.sh/badge?p=tslint-folders)](https://packagephobia.now.sh/result?p=tslint-folders)

[![Greenkeeper badge](https://badges.greenkeeper.io/mrseanryan/tslint-folders.svg)](https://greenkeeper.io/)
[![Dependencies](https://david-dm.org/mrseanryan/tslint-folders.svg)](https://david-dm.org/mrseanryan/tslint-folders)
[![Dev Dependencies](https://david-dm.org/mrseanryan/tslint-folders/dev-status.svg)](https://david-dm.org/mrseanryan/tslint-folders?type=dev)

[![npm Package](https://img.shields.io/npm/v/tslint-folders.svg?style=flat-square)](https://www.npmjs.org/package/tslint-folders)
[![NPM Downloads](https://img.shields.io/npm/dm/tslint-folders.svg)](https://npmjs.org/package/tslint-folders)

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Donate](https://img.shields.io/badge/donate-paypal-blue.svg)](https://paypal.me/mrseanryan)

---

## why?

Save time spent manually code reviewing for 'silly' mistakes such as:

-   Architecture violations:
    -   importing from a 'higher level' package or folder
    -   importing from folders in both directions
-   Importing from an 'invalid' folder like 'dist' or 'modules' (ugly, and in some cases this can cause issues like webpack bundling the same code twice)
-   Pushing code with disabled tests or with breakpoint code
-   Inconsistent naming of files (the default tslint rule `file-name-casing` only allows for 1 style)

---

## features

-   Uses a simple JSON file to model the desired relations between folders and sub-folders
-   Provides a custom tslint rule that walks your TypeScript project, checking for imports that violate the model
-   Other custom rules:
    -   configurably detect disabled tests
    -   detect debug/breakpoint code
    -   detect invalid imports from folders like 'node_modules' or 'dist'
    -   detect filenames that do not match expected style (allows for more than 1 filename style)
-   Provides a tool to generate architecture diagrams from the same model

---

## versioning

We use [SemVer](https://semver.org) for versioning. For the versions available, see the tags on this repository.

---

## usage

### 1 Install via yarn into your website

```
yarn add tslint-folders
```

### 2 Configure tslint to pick up the custom rules

Edit your `tslint.json` to have an entry `"rulesDirectory"` that points to tslint-folders.

Normally this would be like:

```
  "rulesDirectory": "./node_modules/tslint-folders/dist/lib/"
```

See [tslint.tslint-folders.json](https://bitbucket.org/str/tslint-folders/src/master/tslint.tslint-folders.json) for an example.

### 3 Configure the rules

The tslint rules are enabled and configured in `tslint.json`.

See the section under `tsf-folders-imports-between-packages` in [tslint.tslint-folders.json](https://bitbucket.org/str/tslint-folders/src/master/tslint.tslint-folders.json) or the [unit tests](https://bitbucket.org/str/tslint-folders/src/master/test/rules/) for examples.

Optionally, you can split out the tslint-folders configuration into a separate file, like `tslint.tslint-folders.json`. To reference the file, add this code to `tslint.json`:

```
  "extends": "./tslint.tslint-folders.json"
```

Assuming tslint is already in place, then you should now see any unexpected imports (or disabled tests) be flagged by tslint. This should work as usual for tslint: on the command line, or in an editor such as Visual Code (may require refreshing the editor).

### 4 Generate a summary of the package configuration

Assuming that `tslint.tslint-folders.json` has been correctly configured to model the expected package structure, then you can run this command to generate a summary:

```
node node_modules/tslint-folders/dist/tools/docsGenerator tslint.tslint-folders.json Text
```

example output:

```
package structure:
_____
shell - Application Shell
  --> (any)

todo-area - TODO Area Package
  --> grid-package, utils
    folders:
      components - components
        --> (any)

      viewmodels - view models
        --> models, utils

      models - models
        --> utils

      utils - utils
        --> (none)

contact-area - Area that shows contact details
  --> grid-package, utils

grid-package - Grid Package with no dependencies
  --> (none)

utils - Utils package
  --> (none)

_____
```

Allowed imports are shown for each package, after the `-->` arrow.

### using graphviz to generate image diagrams of the architecture

A diagram can be automatically generated from the same config used to validated the code:

![example diagram](https://bitbucket.org/str/tslint-folders/raw/f9c220af572d72f8dc4024d02582cf2b03b15552/static/images/example_diagram_from_Dot_output-2.svg)

see [generating diagrams](https://bitbucket.org/str/tslint-folders/src/master/readme.generating-diagram-images.md) for details.

---

## Summary of the Custom Rules

here is a summary of the current custom rules.

| Rule ID                                    | Description                                                                                                                                                                                                                                                            |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| tsf-folders-disabled-test                  | Detect a disabled unit test, test suite or integration test.                                                                                                                                                                                                           |
| tsf-folders-file-names                     | Validates casing of filenames. Similar to standard rule `file-name-casing` except it supports multiple allowed casings, and disallows file names with invalid characters (such as spaces or commas).                                                                   |
| tsf-folders-import-from-disallowed-folders | Detect an import from a non-standard folder like node_modules                                                                                                                                                                                                          |
| tsf-folders-imports-between-packages       | Detect an import from a 'higher level' package: for example, import from an application 'shell' package when inside an 'area' package. This is the main custom rule. Also can detect when a package has imports using this packages name (instead of a relative path). |
| tsf-folders-test-with-breakpoint           | Detect when an integration test has a break point like `browser.debug()`                                                                                                                                                                                               |

---

## sites

| site                 | URL                                          |
| -------------------- | -------------------------------------------- |
| source code (github) | https://github.com/mrseanryan/tslint-folders |
| github page          | https://mrseanryan.github.io/tslint-folders/ |
| npm                  | https://www.npmjs.com/package/tslint-folders |

---

## approach taken

All of the rules use the same prefix `tsf-folders-`.

To make it clear to developers that a _custom_ rule is involved, all messages from the rules also include the rule id.

Some of these rules could be replaced by standard tslint configuration.
However, having custom rules gives clearer messages to help the developer to know what to fix (or what rule to disable for that piece of code).

Some of the rules are not strictly about 'folders', but are included here as they also seem useful.

For more details and examples please see the [unit tests](https://bitbucket.org/str/tslint-folders/src/master/test/rules/)

---

## building and testing this source code

To work on the source code for tslint-folders, there are a few scripts:

| command       | description                                                             |
| ------------- | ----------------------------------------------------------------------- |
| yarn build    | Builds the rules to the 'dist' folder, from where they can be executed. |
| yarn docs     | Generates summary of the package structure described in tslint.json.    |
| yarn lint     | Lints the source code of the rules.                                     |
| yarn start    | Builds, tests and lints the code.                                       |
| yarn test     | Tests the rules against spec files (\*.lint)                            |
| yarn test-one | Test a single rule against spec files (\*.lint)                         |

---

## unit tests

The unit tests for the rule `tsf-folders-imports-between-packages` are [here](https://bitbucket.org/str/tslint-folders/src/master/test/rules/tsf-folders-imports-between-packages).

The unit tests use test data to check the package boundaries of a fairly typical website.

The matching configuration can be seen in [tslint.tslint-folders.json](https://bitbucket.org/str/tslint-folders/src/master/tslint.tslint-folders.json)

### test data - packages

The test data is based around a website that uses multiple packages:

| Package name | Description                                                                                                                               |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| shell        | The application shell - this is the top level package, and it can import from any other package.                                          |
| todo-area    | A 'todo app' area of the website, that is hosted within the shell. It should not import from the shell or from other 'area' packages.     |
| todo-contact | A 'contact info' area of the website, that is hosted within the shell. It should not import from the shell or from other 'area' packages. |
| grid-package | A UI grid that is used by area packages. It should not import any other recognised packages.                                              |
| utils        | A 'utils' package used by the shell and area packages. It should not import any other recognised packages.                                |

**Example validation**: 'shell' should be able to import from 'todo-area', but not the other way around (shell is at a higher level of abstraction, and also want to avoid 2-way dependencies).

### test data - packages with sub-folders

tslint-folders can also validate imports between sub-folders of a package.

The test data 'todo-area' package is configured with fairly typical sub-folders such as 'components' and 'models'. [tslint.tslint-folders.json](https://bitbucket.org/str/tslint-folders/src/master/tslint.tslint-folders.json) has been configured to check the imports between these folders.

| Sub-folder name | Description                                                                             |
| --------------- | --------------------------------------------------------------------------------------- |
| components      | Top-level folder of UI components. Can import from any of the other recognised folders. |
| viewmodels      | Folder of view models, used by the UI components. Can only import from models or utils. |
| models          | Folder of models, used by the view models. Can only import from utils.                  |
| utils           | A 'utils' folder. It should not import any other recognised folders.                    |

**Example validation**: 'components' should be able to import from 'models', but not the other way around (components is at a higher level of abstraction, and also want to avoid 2-way dependencies).

---

## developing code in _this_ repository

see the [contributing readme](CONTRIBUTING.md).

## origin

This project is based on the excellent seeder project [typescript-library-starter](https://github.com/alexjoverm/typescript-library-starter).

The project was started to avoid having to repeatedly fix similar coding issues in large TypeScript code bases.

### ORIGINAL readme (from the seeder project)

[see here](https://github.com/mrseanryan/tslint-folders/blob/master/readme.original.md)

---

## that's it

That's pretty much it. Let me know if this is useful or how it can be improved!

## authors

Original work by Sean Ryan - mr.sean.ryan(at gmail.com)

## licence = MIT

This project is licensed under the MIT License - see the [LICENSE](https://github.com/mrseanryan/tslint-folders/blob/master/LICENSE) file for details
