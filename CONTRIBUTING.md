# Contributing to tslint-folders

## Instructions

These steps will guide you through contributing to this project:

- Fork the repo
- Clone it and install dependencies

		git clone https://github.com/YOUR-USERNAME/tslint-folders
		yarn

Make and commit your changes. Make sure the commands `yarn build` and `yarn test:prod` are working.

Finally open a [GitHub Pull Request](https://github.com/mrseanryan/tslint-folders/compare?expand=1) with a clear list of what you've done (read more [about pull requests](https://help.github.com/articles/about-pull-requests/)). Try to make your commits atomic (one change per commit).

### dependencies

We use `semantic-release` to manage versioning and the build process.

```
npm install -g semantic-release-cli
```

We use [yarn](https://yarnpkg.com/lang/en/docs/install) because we like it, and to avoid [an issue](https://github.com/commitizen/cz-cli/issues/10) with `commitizen` on Windows.

### use a feature branch

Any pushes to `master` will try to publish to npm (if travis build succeeds).
So it's best to first develop on a feature branch - named like `feature/my-feature`, and then when it has a green build, and it is reviewed, we will merge it to master.

This project uses `semantic release`, so when committing its best to use this script:

`./commit.sh`

### commit message format

Please **use an appropriate prefix to your commit messages**, so that `semantic release` will know how to decide the next semantic version. See [Angular commit message conventions](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines).

### running unit tests

locally: (minimal build)

`yarn build-and-test`

before pushing: (saves time waiting for a failed build)

`yarn test:prod`

### merging to master [restricted access!] (will create a release!)

merging a feature branch into master: (after the build is green!)

#### via github site (recommended)

- create pull request for the feature branch
- merge the pull request into master

#### via command line (not recommended, as then need to delete branches)

```
git checkout master
git fetch && git pull
git merge feature/my-feature
git push
```

### releasing (from master branch) [restricted access!]
To release, simply push to github. This will automatically run builds, generate release notes on github, and release to npm!

`git push`
