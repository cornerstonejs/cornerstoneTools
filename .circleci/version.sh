# reads version from package.json and sets prelease equal to Circle CI build number
if [ $CI ] && [ $CIRCLE_BUILD_NUM ]
then
	PACKAGE_VERSION=$(cat package.json \
		| grep version \
		| head -1 \
		| awk -F: '{ print $2 }' \
		| sed 's/[",]//g' \
		| tr -d '[[:space:]]')

	echo "Found package version: $PACKAGE_VERSION"

	printenv
	echo "Circle Build Num: $CIRCLE_BUILD_NUM"
	NEW_PACKAGE_VERSION=$(echo $PACKAGE_VERSION | sed -e "s/^\([0-9]*\.[0-9]*\.[0-9]*\-[a-z]*\).[0-9]*$/\1.$CIRCLE_BUILD_NUM/")
	echo "Setting version to: $NEW_PACKAGE_VERSION"
	# uses npm-version to set version in package.json
	# see https://docs.npmjs.com/cli/version
	npm version $NEW_PACKAGE_VERSION --no-git-tag-version
	# git add package.json
	# git add package-lock.json
	# git add .
	# git commit -m "updated version to $newversion [ci skip]"
else
  	echo "Don't forget to update the build version!"
fi