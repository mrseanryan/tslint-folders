# TODO

- [x] setup basic tslint, with standard rules to lint its source
- [x] re-make test data - packages
- [x] remove refs to sdk
- [x] re-make unit tests
- [x] config in tslint.json
- [x] merge tests for 'tslint-folders-imports-from-self' into 'tslint-folders-imports-between-packages'
- [x] replace ignoreTests, ignoreFolders with ignorePaths: regex[]. also add to main rule
- [x] model as a _graph_
- [x] list TODOs for the new tslint props
- [x] publish to npm (dist only, not source), consume
- [x] yarn docs (generates a 'graph')
- [x] publish to npm (dist only, not source), consume
- [ ] add tests for sub-folders (under todo-area). include false positives: similar folders under package with no sub folders configured (contact-area).
- [ ] up major to 1.0.1
- [ ] publish to npm (dist only, not source), consume

if OK to open-source:

- [ ] update readme: `node_modules/tslint-folders/tools` -> `node_modules/tslint-folders/dist/tools`
- [ ] make this repo public (URL same?)
- [ ] publish to npm with the source
- [ ] consume

---

config:

- [x] config from tslint-folders.json that's imported by tslint.json
- [ ] throw if config has circ reference

- [x] 'separable package' - import no recognised packages : no special case needed (simply no children)

---

- model internal folders:

components
viewmodels
models
services
utils

-- PackageSubFolder : PackageFolder

- container: Package (no hierarchy of sub folders)

- can import any PackageNode children of container

- if importing a recognised PackageSubFolder (from container.allowedFolders)

then only allow if in this.allowedFolders

---

## model dumping

[x] - `yarn docs` outputs a text graph

dump to simple text format

so don't need dot to ascii

format:

```
packageName1 --> packageName2, packageName3
  folder1 --> folder2, folder3
  folder2 --> folder3
  folder3
```

xx - md format?

xx - dot as alt format could also be useful

```
yarn docs --format=dot
```

---

## disallow import [relative, src] from recognised package

extend the main rule, using the config:

- [ ] import from recognised package should not be relative (like /myPackage/)
- [ ] import from recognised package should not include /src/
      by adding a ban prop into PackageFolder:

      ```
      "ban": ["{PACKAGE}/src/", "/{PACKAGE}/"]
      ```

---

## make the 'test' rules be configurable

- [ ] make rule customisable: tslint-folders-test-with-breakpoint
      by adding an includePaths: string[] prop and a debugTokens: ["browser.debug"]

- [ ] make rule customisable: tslint-folders-disabled-tests
      by adding an includePaths: string[] prop and a ban: ["it.only", "it.skip","describe.only","describe.skip"]
