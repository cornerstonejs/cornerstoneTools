# reads version from package.json and sets prelease equal to Circle CI build number
if [ $CI ] && [ $CIRCLE_BUILD_NUM ]
then
  newversion=$(echo $npm_package_version | sed -e "s/^\([0-9]*\.[0-9]*\.[0-9]*\-[a-z]*\).[0-9]*$/\1.$CIRCLE_BUILD_NUM/")
  echo "Setting version to $newversion"
  # uses npm-version to set version in package.json
  # see https://docs.npmjs.com/cli/version
  npm version $newversion --no-git-tag-version
  # git add package.json
  # git add package-lock.json
  # git add .
  # git commit -m "updated version to $newversion [ci skip]"
else
  echo "Don't forget to update the build version!"
fi