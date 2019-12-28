#!/bin/bash
set -e

curl -OL https://github.com/protocolbuffers/protobuf/releases/download/v3.7.1/protoc-3.7.1-linux-x86_64.zip
sudo unzip -o protoc-3.7.1-linux-x86_64.zip -d /usr/local bin/protoc
sudo unzip -o protoc-3.7.1-linux-x86_64.zip -d /usr/local 'include/*'
rm -f protoc-3.7.1-linux-x86_64.zip

cd cacli && curl -sL https://git.io/goreleaser | bash

cd ../trainer && python setup.py all

# Read asset tags.
response=$(curl -s "https://api.github.com/repos/cloud-annotations/training/releases/tags/$TRAVIS_TAG?access_token=$GITHUB_TOKEN")

# Get ID of the asset based on given filename.
eval $(echo "$response" | grep -m 1 "id.:" | grep -w id | tr : = | tr -cd '[[:alnum:]]=')
[ "$id" ] || {
  echo "Error: Failed to get release id for tag: $TRAVIS_TAG"
  echo "$response" | awk 'length($0)<100' >&2
  exit 1
}

# Upload asset
echo "Uploading asset... "
curl --data-binary @training.zip -H "Content-Type: application/octet-stream" "https://uploads.github.com/repos/cloud-annotations/training/releases/$id/assets?name=training.zip&access_token=$GITHUB_TOKEN"
