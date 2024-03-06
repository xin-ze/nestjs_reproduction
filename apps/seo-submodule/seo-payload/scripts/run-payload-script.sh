#!/bin/bash

FILE_PATH="${1}"

if [ -f "$FILE_PATH" ]; then
  npm run ts-node "$FILE_PATH"
else
  npm run ts-node "apps/seo-submodule/seo-payload/src/scripts/${1}"
fi
