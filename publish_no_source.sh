#!/usr/bin/env bash
yarn pub-prepare-no-source
cd dist
npm publish
cd ..
