#!/bin/bash
set -e

curl -OL https://github.com/protocolbuffers/protobuf/releases/download/v3.7.1/protoc-3.7.1-linux-x86_64.zip
sudo unzip -o protoc-3.7.1-linux-x86_64.zip -d /usr/local bin/protoc
sudo unzip -o protoc-3.7.1-linux-x86_64.zip -d /usr/local 'include/*'
rm -f protoc-3.7.1-linux-x86_64.zip

cd cacli && curl -sL https://git.io/goreleaser | bash

cd ../trainer && python setup.py all
curl --data-binary @training.zip -H "Content-Type: application/octet-stream" "https://uploads.github.com/repos/cloud-annotations/training/releases/$TRAVIS_TAG/assets?name=training.zip&access_token=$GITHUB_TOKEN"