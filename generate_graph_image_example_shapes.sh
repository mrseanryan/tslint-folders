#!/usr/bin/env bash

# colorScheme value is from: https://graphviz.gitlab.io/_pages/doc/info/colors.html
./generate_graph_image.sh tslint.tslint-folders.json -colorScheme=pastel19 -maxColors=9 -subTitle="Top-level Packages" -title="Project Packages" -packageShape=octagon -subFolderShape=component
