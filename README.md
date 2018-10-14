# tslint-folders

Use tslint to check for invalid imports between packages and folders in your TypeScript project.

Automatic validation and documentation of package architecture.

---

## usage

1 Install via yarn into your website

```
yarn add tslint-folders
```

2 Configure tslint to pick up the custom rules

Edit your `tslint.json` to have an entry `"rulesDirectory"` that points to tslint-folders.

Normally this would be like:

```
  "rulesDirectory": "./node_modules/tslint-folders/dist/"
```

See [tslint.tslint-folders.json](tslint.tslint-folders.json) for an example.

3 Configuring the rules

The tslint rules are enabled and configured in `tslint.json`.

See the section under `tslint-folders-imports-between-packages` in [tslint.tslint-folders.json](tslint.tslint-folders.json) or the [unit tests](./test/rules/) for examples.

Optionally, you can split out the tslint-folders configuration into a separate file, like `tslint.tslint-folders.json`. To reference the file, add this code to `tslint.json`:

```
  "extends": "./tslint.tslint-folders.json"
```

Assuming tslint is already in place, then you should now see any unexpected imports (or disabled tests) be flagged by tslint. This should work as usual for tslint: on the command line, or in an editor such as Visual Code (may require refreshing the editor).

4 Generating a summary of the package configuration

Assuming that `tslint.tslint-folders.json` has been correctly configured to model the expected package structure, then you can run this command to generate a summary:

```
node node_modules/tslint-folders/tools/docsGenerator tslint.tslint-folders.json Text
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

---

## Summary of the Custom Rules

here is a summary of the current custom rules.

| Rule ID                                       | Description                                                                                                                                                                                                                                                            |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| tslint-folders-disabled-test                  | Detect a disabled unit test, test suite or integration test.                                                                                                                                                                                                           |
| tslint-folders-import-from-disallowed-folders | Detect an import from a non-standard folder like node_modules                                                                                                                                                                                                          |
| tslint-folders-imports-between-packages       | Detect an import from a 'higher level' package: for example, import from an application 'shell' package when inside an 'area' package. This is the main custom rule. Also can detect when a package has imports using this packages name (instead of a relative path). |
| tslint-folders-test-with-breakpoint           | Detect when an integration test has a break point like `browser.debug()`                                                                                                                                                                                               |

---

## sites

| site                    | URL                                          |
| ----------------------- | -------------------------------------------- |
| bitbucket (source code) | https://bitbucket.org/str/tslint-folders     |
| npm                     | https://www.npmjs.com/package/tslint-folders |

---

## approach taken

All of the rules use the same prefix `tslint-folders-`.

To make it clear to developers that a _custom_ rule is involved, all messages from the rules also include the rule id.

Some of these rules could be replaced by standard tslint configuration.
However, having custom rules gives clearer messages to help the developer to know what to fix (or what rule to disable for that piece of code).

Some of the rules are not strictly about 'folders', but are included here as they also seem useful.

For more details and examples please see the [unit tests](./test/rules/)

---

## building and testing this source code

To work on the source code for tstlint-folders, there are a few scripts:

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

The unit tests for the rule `tslint-folders-imports-between-packages` are [here](./test/rules/tslint-folders-imports-between-packages).

The unit tests use test data to check the package boundaries of a fairly typical website.

The matching configuration can be seen in [tslint.tslint-folders.json](tslint.tslint-folders.json)

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

The test data 'todo-area' package is configured with fairly typical sub-folders such as 'components' and 'models'. [tslint.tslint-folders.json](tslint.tslint-folders.json) has been configured to check the imports between these folders.

| Sub-folder name | Description                                                                             |
| --------------- | --------------------------------------------------------------------------------------- |
| components      | Top-level folder of UI components. Can import from any of the other recognised folders. |
| viewmodels      | view models folder of UI components. Can only import from models or utils.              |
| models          | models folder of UI components. Can only import from utils.                             |
| utils           | A 'utils' folder. It should not import any other recognised folders.                    |

**Example validation**: 'components' should be able to import from 'models', but not the other way around (components is at a higher level of abstraction, and also want to avoid 2-way dependencies).

## that's it

That's pretty much it. Let me know if this is useful or how it can be improved!

## licence = MIT

License is MIT, so feel free to use or modify.
