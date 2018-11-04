# TODO

- [x] setup basic tslint, with standard rules to lint its source
- [x] re-make test data - packages
- [x] remove refs to sdk
- [x] re-make unit tests
- [x] config in tslint.json
- [x] merge tests for 'tsf-folders-imports-from-self' into 'tsf-folders-imports-between-packages'
- [x] replace ignoreTests, ignoreFolders with ignorePaths: regex[]. also add to main rule
- [x] model as a _graph_
- [x] list TODOs for the new tslint props
- [x] publish to npm (dist only, not source), consume
- [x] yarn docs (generates a 'graph')
- [x] publish to npm (dist only, not source), consume

if OK to open-source:

- [x] update readme: `node_modules/tslint-folders/tools` -> `node_modules/tslint-folders/dist/tools`
- [x] make this repo public (URL same?)
- [x] publish to npm with the source
- [x] consume

- [x] Add isThirdParty flag to PackageConfig so is not listed by docs.
- [x] add keywords to package.json for npm

- [x] rename isThirdParty to isExternal

- [x] new rule `tsf-folders-file-names` [see branch 'feature/file-name-casing'] allowing _multiple_ values. see palantir `file-name-casing`

- [x] add tests for sub-folders (under todo-area). include false positives: similar folders under package with no sub folders configured (contact-area).
- [x] publish to npm (with source), consume
- [x] allow disable check on sub folders
- [x] add test where sub folders are below another folder
- ~~bad import from sub folder should be warning not error~~
- [x] rename rules to tsf- to avoid rules failing to load in projects that use other rule packages
- [x] up minor version, pub
- [x] ts-node can be _dev_ dep?
- [x] consume

- [x] allow gen doc w/o sub folders

- [x] add Dot format

- ~~add DotStyled~~ ~~allow any case~~

- [x] add example to generate png

- [x] add the missing options -dotColorScheme=path to pick up colors
- [x] doc the new options - at least set them in package.json

- [x] refactor

- [x] add `-outpath=<path to output file>`

- n/a `-orientation=<landscape|portrait>` -> landscape=true (default, due to sub-folder clusters)

- n/a (future - filtering avoids this) some way to have 'portrait' layout? (rankdir does not really work)

---

### BEGIN diagrams

- the diagram is too crowded!

- ... group pkgs with same incomings. use points or invisible nodes

- [x] try `compound=true`
- [x] try `graph [ concentrate=true ...`

_not true! - ~~// note: compound and concentrate do NOT work together? (would see error from dot)~~_

- [x] fix new bug in optimizer: only replace edge from cluster if valid for ALL nodes in cluster

- [x] add `-clusterFromTslintJson`, `diagramCluster=<cluster name>` to `tslint.json` - then GraphOptimizer can cluster by that name

- [x] style \* package a bit like external

- [x] test with, w/o the optimizer

- [x] add `-disableGraphOptimizer`

- [x] add `-package=<package importPath>` to out for that package only (hides topLevel cluster)

- [x] (cosmetic) add -packageShape=box|oval|octagon|component|cyclinder|box3d|folder (default is oval) -subFolderShape=box|oval|octagon|component|cyclinder|box3d|folder (default is folder)

- [ ] consume

---

- [x] improve optimizer

- [x] add `-importBlacklist=<package name,package name>` to filter the imports (the referenced packages)

- [x] add `-showImportAnyAsNodeNotEdges` - renders \* as 1 edge to an "(any)" node

- try: `strict digraph x { ...`

ref: https://graphviz.gitlab.io/faq/#FaqMerge

- n/a - concentrate does this! ~~try add multiple invisible points to give layouter flexibility:~~

- n/a other graphviz diagram type?

- n/a try 'rank' to group nodes (need hint from tslint.json?) { rank=same; b, c, d }
- n/a try `group` (avoids edge crossings?)

### END diagrams

---

- [ ] make other rules configurable, without breaking config (cover via test sub-folders named by version) -

- [ ] support typescript 3 -

- [ ] release notes file?

---

### d3

- [ ] d3 format (will not work in .md) - mini site - can have interaction to filter edges for selected node!
- [ ] d3 mini site: bundle into 1 or 2 files. so use react, ts or vue?

---

### plantUml/c4

- [ ] output to plantUml format? (see webscratchgit, crafting doc)

- [ ] output to plantUml C4 format? (see webscratchgit, crafting doc)

- [ ] add format like C4 -

---

- [ ] try add jest snapshot tests for the doc gen

## 'nice to have' TODOs

- [ ] ?add vs code debug config

- ~~rename package to module ? is clearer? but not really correct, usually is 1 file. up minor.~~

- ~~? add Jpg format (new npm? from new src folder)~~ use graphviz!

- [ ] ? add examples folder with a site that has issues

---

## notes

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

### model dumping

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

- ~~md format?~~

* [x] dot as alt format could also be useful

* ~~jpg format (internally dot -> jpg) in separate project tslint-folders-diagrams to control npm size~~

```
yarn docs tslint.json Dot
```

---

#### diagram notes

- add invisible.point - but concentrate does this!

```
/_ graph with invisible points _/
digraph G {
d1 [shape=point,width=0.01,height=0.01];
{a, b, c} -> d1 [dir=none];
d1 -> d;
d -> e;
}
```

---

### TODO disallow import [relative, src] from recognised package

extend the main rule, using the config:

- [ ] import from recognised package should not include /src/
      by adding a ban prop into PackageFolder:

      ```
      "ban": ["{PACKAGE}/src/", "/{PACKAGE}/"]
      ```

- [ ] (see ban prop) import from recognised package should not be relative (like /myPackage/)

---

### TODO make the 'test' rules be configurable

- make configurable, without breaking config (cover via test sub-folders named by version)

- [ ] make rule customisable: tsf-folders-test-with-breakpoint
      by adding an includePaths: string[] prop and a debugTokens: ["browser.debug"]

- [ ] make rule customisable: tsf-folders-disabled-tests
      by adding an includePaths: string[] prop and a ban: ["it.only", "it.skip","describe.only","describe.skip"]

---

### TODO ts versions

- support typescript 3

- ts version history:

https://github.com/Microsoft/TypeScript/commits/master/package.json

- version to match ts ? else confusing. but need minor to make a breaking change!

```
-- tsf 2.9m.p = ts 2.9
-- tsf 3.0m.p = ts 3.0
-- tsf 3.1m.p = ts 3.1
-- tsf 3.2m.p = ts 3.2
where m = minor, p = patch
```

- add above summary to readme

- branch like versions/tsf2.9
- pub to npm as normal, with correct peer deps
- dev on feature/x -> master
- can rebase version branches onto master, as needed (bash script)
- do NOT dev on version branch
- doc in readme

- how does tslint manage it?
- is tslint version more important? But less so for user

---

### todo c4

- [ ] add support for alt format C4 - plantUml C4?

https://c4model.com/#notation

context, container, component, (code)

---

## end
