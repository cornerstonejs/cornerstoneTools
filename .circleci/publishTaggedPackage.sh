#!/bin/bash

echo 'looking for tag'
echo "branch: ${CIRCLE_BRANCH}"

## Capture branch name/type
hotfixRegex="hotfix\/(.*)"
featureRegex="feature\/(.*)"

packageTag=""
fullBranch="${CIRCLE_BRANCH}"

if [[ $fullBranch =~ $hotfixRegex ]]
then
    echo "regex: ${BASH_REMATCH[1]}"
    packageTag="fix-${BASH_REMATCH[1]}"
    echo "export PACKAGE_TAG=$packageTag" >> $BASH_ENV
elif [[ $fullBranch =~ $featureRegex ]]
then
    echo "regex: ${BASH_REMATCH[1]}"
    packageTag="feature-${BASH_REMATCH[1]}"
    echo "export PACKAGE_TAG=$packageTag" >> $BASH_ENV
else
    echo "$fullBranch is not a hotfix or feature branch"
fi

echo "TAG: $packageTag"
echo "TAG: $PACKAGE_TAG"

npm publish --tag $packageTag
