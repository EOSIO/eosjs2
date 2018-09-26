#!/bin/bash
#generate typedoc into ./docs/build
./node_modules/.bin/typedoc ./src --options typedoc.json
#copy book.json into new build directory
cp ./docs/book.json ./docs/build/book.json
#copy style overrides into new build directory
cp -R ./docs/styles ./docs/build/styles
#copy layout overrides into new build directory
cp -R ./docs/layouts ./docs/build/layouts
#copy images into new build directory
cp -R ./docs/images ./docs/build/images
#cd to ./docs/build and run gitbook install/build
cd ./docs/build && ../../node_modules/.bin/gitbook install && ../../node_modules/.bin/gitbook build .
