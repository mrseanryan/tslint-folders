#!/usr/bin/env bash

# colorScheme value is from: https://graphviz.gitlab.io/_pages/doc/info/colors.html
./generate_graph_image.sh tslint.tslint-folders.json -colorScheme=rdylgn11 -maxColors=11 -subTitle="Top-level Packages" -title="Project Packages"
