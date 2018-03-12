#!/bin/sh

rootDirectory=$(git rev-parse --show-toplevel)

cd $rootDirectory

function obfs {
    echo "Generating obfuscation file"
    OUTPUT_FILE=Chrome/DoubanFollow/DoubanFollow.user.js
    javascript-obfuscator DoubanFollow.user.js -o $OUTPUT_FILE
    git add $OUTPUT_FILE
}

function zipfile {
    echo "Generating zip file"
    (cd Chrome; zip -r DoubanFollow.zip DoubanFollow)
    git add Chrome/DoubanFollow.zip
}

function gencrx {
    node_modules/crx/bin/crx.js pack -o Chrome/DoubanFollow.crx -p Chrome/DoubanFollow.pem Chrome/DoubanFollow
    git add Chrome/DoubanFollow.crx
}

changedFiles=($(git diff --cached --name-only))
for changedFile in "${changedFiles[@]}"; do
    if [[ $changedFile == 'DoubanFollow.user.js' ]]; then
        obfs
        break
    fi
done

changedFiles=($(git diff --cached --name-only))
for changedFile in "${changedFiles[@]}"; do
    if [[ $changedFile =~ ^Chrome/DoubanFollow.* ]]; then
        zipfile
        gencrx
        break
    fi
done

if [[ -n $FORCE ]];then
    obfs
    zipfile
    gencrx
fi
