#!/usr/bin/env bash

# assumption: the machine has an environment variable TEMP pointing to a temporary files location.

TEMP_OUT_DIR=$TEMP

OUT_DOT_PATH=$TEMP_OUT_DIR/tslint-folders-docs.dot;
OUT_IMAGE_PATH=$TEMP_OUT_DIR/tslint-folders-docs.svg;

PATH_TO_TSLINT_JSON=$1;

ECHO yarn docs ...;
yarn --silent docs $PATH_TO_TSLINT_JSON Dot -outpath=$OUT_DOT_PATH "$2" "$3" "$4" "$5" "$6" "$7"

ECHO dot ...;
dot $OUT_DOT_PATH -Tsvg -o $OUT_IMAGE_PATH;

ECHO graph image is at $OUT_IMAGE_PATH;

ECHO [done];
