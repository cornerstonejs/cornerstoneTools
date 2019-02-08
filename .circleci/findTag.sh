## Capture branch name/type
hotfixRegex="hotfix\/(.*)"
featureRegex="feature\/(.*)"

taggedPublish=false
packageTag=""
fullBranch="${CIRCLE_BRANCH}"
do
    if [[ $fullBranch =~ $hotfixRegex ]]
    then
        taggedPublish=true
        packageTag="fix-${BASH_REMATCH[1]}.${CIRCLE_BUILD_NUM}"
        echo 'export TAGGED_PUBLISH=$taggedPublish' >> $BASH_ENV
        echo 'export PACKAGE_TAG=$packageTag' >> $BASH_ENV
    elif [[ $fullBranch =~ $featureRegex ]]
    then
        taggedPublish=true
        packageTag="feature-${BASH_REMATCH[1]}.${CIRCLE_BUILD_NUM}"
        echo 'export TAGGED_PUBLISH=$taggedPublish' >> $BASH_ENV
        echo 'export PACKAGE_TAG=$packageTag' >> $BASH_ENV
    else
        echo "$fullBranch is not a hotfix or feature branch"
    fi
done
