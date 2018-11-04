# TODOs that are done

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

- [x] add diagram output
