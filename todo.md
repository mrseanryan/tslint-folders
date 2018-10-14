# TODO

- [x] setup basic tslint, with standard rules to lint its source
- [x] re-make test data - packages
- [x] remove refs to sdk
- [x] re-make unit tests
- [x] config in tslint.json
- [ ] merge tests for 'tslint-folders-imports-from-self' into 'tslint-folders-imports-between-packages'
- [ ] replace ignoreTests, ignoreFolders with ignorePaths: regex[]. also add to main rule
- [ ] model as a _graph_
- [ ] add tests for sub-folders (under todo-area). include false positives: similar folders under package with no sub folders configured.
- [ ] publish to npm (dist only, not source), consume
- [ ] yarn dump-graph

if OK to open-source:

- [ ] publish to npm with the source
- [ ] consume
- [ ] make this repo public
- [ ] consume

---

config:

- [ ] config from tslint-folders.json that's imported by tslint.json
- [ ] throw if config has circ reference

---

PackageFolder

-- allowedFolders: PackageFolder[]

-- importPath // regex

- description

Package : PackageFolder

config:

graph of Package - root: PackageFolder

- a package can only import child (or sub-child)

- pain to maintain? only if we mistakenly omit children

- new package: will be ignored

- some sub trees duplicated - e.g. all editors can use utils

- 'separable package' - import no recognised packages : no special case needed (simply no children)

---

- model internal folders:

components
viewmodels
models
services
utils

-- PackageSubFolder : PackageFolder

- allowedFolders - throw if try to add a non PackageSubFolder

- container: Package (no hierarchy of sub folders)

- can import any PackageNode children of container

- if importing a recognised PackageSubFolder (from container.allowedFolders)

then only allow if in this.allowedFolders

---

yarn dump-graph

outputs text �graph�

dump to simple text format

so don't need dot to ascii

- but dot as alt format could be useful

format:

```
packageName1 --> packageName2, packageName3
  folder1 --> folder2, folder3
  folder2 --> folder3
  folder3
```

---

extend the main rule, using the Config for:

- [ ] import from recognised package should not be relative (like /myPackage/)
- [ ] import from recognised package should not include /src/
      by adding a ban prop?

Other rules:

- [ ] make rule customisable: tslint-folders-test-with-breakpoint
      by adding a debugTokens: [] and an includePaths prop

- [ ] make rule customisable: tslint-folders-disabled-tests
      by adding an includePaths prop
