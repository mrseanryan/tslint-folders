#!/usr/bin/env bash

# assumption: the machine has an environment variable TEMP pointing to a temporary files location.

TEMP_OUT_DIR=`mktemp -d 2>/dev/null || mktemp -d -t 'temp'`

OUT_DOT_PATH=$TEMP_OUT_DIR/tslint-folders-docs.dot;
OUT_IMAGE_PATH=$TEMP_OUT_DIR/tslint-folders-docs.svg;

PATH_TO_TSLINT_JSON=$1;

echo yarn docs ...;
yarn --silent docs $PATH_TO_TSLINT_JSON Dot -outpath=$OUT_DOT_PATH "$2" "$3" "$4" "$5" "$6" "$7"

echo dot ...;
dot $OUT_DOT_PATH -Tsvg -o $OUT_IMAGE_PATH;

echo graph image is at $OUT_IMAGE_PATH;

echo [done];
