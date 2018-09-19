# Generate this version's "book"
cd docs
rm -rf _book
gitbook install
gitbook build

# Move our book to it's own version folder
cd _book/
mkdir v3.0.0
mv -v * v3.0.0/
cd ..

# Grab our current gh-pages files
# Remove it's version 3, and move it to our _book
git clone -b gh-pages --single-branch git@github.com:cornerstonejs/cornerstoneTools.git _live-book/
rm -rf _live-book/v3.0.0/
mv -v _live-book/* _book/

# Commit & Push
cd _book/
git init
git add -A
git commit -m 'update book'
git push -f git@github.com:cornerstonejs/cornerstoneTools.git master:gh-pages
cd ..

# Cleanup
rm -rf _live-book
rm -rf _book
