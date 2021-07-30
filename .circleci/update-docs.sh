#!/bin/bash

# Set directory to location of this script
# https://stackoverflow.com/a/3355423/1867984
cd "$(dirname "$0")"

## Generate DOCMA API Docs
cd ..
npm run docs:api

# Try to patch Gitbook's broken deep dependency on graceful-fs
npm install --save gitbook-cli
cd node_modules/gitbook-cli/node_modules/npm
npm install graceful-fs@4.2.0 --save
cd ../../
./bin/gitbook.js fetch
cd ../../

# Generate latest output
# Clear previous output, generate new
cd ./docs/latest
rm -rf _book
../../node_modules/gitbook-cli/bin/gitbook.js install
../../node_modules/gitbook-cli/bin/gitbook.js build
cd ../../


# Generate all version's GitBook output
# For each directory in /docs ...
cd ./docs/previous
for D in *; do
  if [ -d "${D}" ]; then

		echo "Generating output for: ${D}"
		cd "${D}"

		# Clear previous output, generate new
		rm -rf _book
		../../../node_modules/gitbook-cli/bin/gitbook.js install
		../../../node_modules/gitbook-cli/bin/gitbook.js build

		cd ..
  fi
done
cd ..

# Move CNAME File into `latest`
cp CNAME ./latest/CNAME

# Create a history folder in our latest version's output
mkdir ./latest/_book/history

# Move each version's files to latest's history folder
cd previous
for D in *; do
  if [ -d "${D}" ]; then

		echo "Moving ${D} to the latest version's history folder"

		mkdir "../latest/_book/history/${D}"
		cp -v -r "./${D}/_book"/* "../latest/_book/history/${D}"

	fi
done
cd ..

# Generate Examples
cd ./../examples/
gem install bundler:2.0.1
bundle check || bundle install
export JEKYLL_ENV="production"
bundle exec jekyll build --config _config.yml,_config_production.yml


# Create examples directory
cd ./../docs/
mkdir ./latest/_book/examples

# Move examples output to folder
mv -v "./../examples/_site"/* "./latest/_book/examples"

# Set User
git config --global user.email "danny.ri.brown@gmail.com"
git config --global user.name "dannyrb"

# Commit & Push
cd ./latest/_book/
git init
git add -A
git commit -m 'update book'
git push -f git@github.com:cornerstonejs/cornerstoneTools.git master:gh-pages
cd ..

# Used to pause so you can read output before dismissing
# read -n 1 -s -r -p "Press any key to exit"
