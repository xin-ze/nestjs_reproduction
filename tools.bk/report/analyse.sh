#!/bin/zsh
# run analyze and put reports in indicated path
# run with work dir in root path of this repo

PROJECT="${1:-'ui-content'}"
NAME="${2:-'report'}"
PLACE="${3:-'./'}"
DATE=$(date '+%m%d-%H')

echo "PROJECT : $PROJECT"
echo "Name : $NAME"
echo "Generated Place: $PLACE"
npm run $PROJECT\:analyze -- --skip-nx-cache | tee $PLACE$PROJECT-$DATE-$NAME.bundle.txt
cp ./dist/apps/$PROJECT/.next/analyze/client.html $PLACE$PROJECT-$DATE-$NAME.client.html
