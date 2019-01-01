#!/usr/bin/env bash

ECHO Running with extra 'optimization' options to filter some items from the *Mx* diagram

./generate_graph_image.sh  /tmp/tslint.tslint-folders.mx.json  -importBlacklist=mendixmodelsdk -showImportAnyAsNodeNotEdges -clusterFromTslintJson -importWhitelist=microflowEditor
