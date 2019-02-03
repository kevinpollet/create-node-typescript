#!/bin/bash

set -e

PROJECT_DIR=$(pwd)
TMP_PROJECT_DIR=tmp

rm -rf $TMP_PROJECT_DIR

npm run build

$PROJECT_DIR/bin/create-node-typescript.js \
  --name test \
  --description test \
  --author test \
  --packageManager npm \
  $TMP_PROJECT_DIR

cd $TMP_PROJECT_DIR

npm run build

npm run test
