cd docs
rm -rf _book
gitbook install
gitbook build
cd _book/
mkdir v3
mv -v * v3/
cd ..
cp assets/CNAME _book/CNAME
cd _book
git clone git@github.com:cornerstonejs/cornerstoneTools.git master:gh-pages
git add -A
git commit -m 'update book'
git push -f git@github.com:cornerstonejs/cornerstoneTools.git master:gh-pages
