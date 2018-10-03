#!/bin/bash

# Set directory to location of this script
# https://stackoverflow.com/a/3355423/1867984
cd "$(dirname "$0")"

# Generate all version's GitBook output
cd ./../docs/
for D in *; do
    if [ -d "${D}" ]; then
        echo "Generating output for: ${D}"
		cd "${D}"

		# Clear previous output, generate new
		rm -rf _book
		gitbook install
		gitbook build

		cd ..
    fi
done

# Move CNAME File into `latest`
cp CNAME ./latest/CNAME

# Create a history folder in our latest version's output
mkdir ./latest/_book/history

# Move each version's files to latest's history folder
for D in *; do
	if [ -d "${D}" ]; then
		if [[ "${D}" == v* ]] ; then
    		echo "Moving ${D} to the latest version's history folder"

			mkdir "./latest/_book/history/${D}"
			mv -v "./${D}/_book"/* "./latest/_book/history/${D}"
		fi
	fi
done

# Commit & Push
cd ./latest/_book/
git init
git add -A
git commit -m 'update book'
git push -f git@github.com:cornerstonejs/cornerstoneTools.git master:gh-pages
cd ..

# Used to pause so you can read output before dismissing
read -n 1 -s -r -p "Press any key to exit"