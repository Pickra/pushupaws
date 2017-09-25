#!/usr/bin/env bash

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

npm publish

if [ $? -eq '0' ]; then
    curl -X POST -d "{ \"result\": \"pushupaws$PACKAGE_VERSION successfully published\" }" $NOTIFICATION_URL
else
    curl -X POST -d "{ \"result\": \"There was an error publishing pushupaws$PACKAGE_VERSION\" }" $NOTIFICATION_URL
fi
