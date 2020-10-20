#!/bin/bash
set -e

# Install the protobuf compiler.
# protobuf compiler installed in travis now...
# curl -OL https://github.com/protocolbuffers/protobuf/releases/download/v3.7.1/protoc-3.7.1-linux-x86_64.zip
# sudo unzip -o protoc-3.7.1-linux-x86_64.zip -d /usr/local bin/protoc
# sudo unzip -o protoc-3.7.1-linux-x86_64.zip -d /usr/local 'include/*'
# rm -f protoc-3.7.1-linux-x86_64.zip

# TODO: https://developer.github.com/changes/2020-02-10-deprecating-auth-through-query-param/

# Install goreleaser and release binaries.
cd cacli && curl -sL https://git.io/goreleaser | bash

# Build training zip.
cd ../trainer && python setup.py no_pull

# Get ID of the released based on its version tag.
response=$(curl -s "https://api.github.com/repos/cloud-annotations/training/releases/tags/$TRAVIS_TAG?access_token=$GITHUB_TOKEN")

eval $(echo "$response" | grep -m 1 "id.:" | grep -w id | tr : = | tr -cd '[[:alnum:]]=')
[ "$id" ] || {
  echo "Error: Failed to get release id for tag: $TRAVIS_TAG"
  echo "$response" | awk 'length($0)<100' >&2
  exit 1
}

# Upload asset.
echo "Uploading asset... "
curl --data-binary @training.zip -H "Content-Type: application/octet-stream" "https://uploads.github.com/repos/cloud-annotations/training/releases/$id/assets?name=training.zip&access_token=$GITHUB_TOKEN"

# Get the sha for cacli homebrew formula
content_url="https://api.github.com/repos/cloud-annotations/homebrew-tap/contents/cacli.rb?access_token=$GITHUB_TOKEN"
response=$(curl -s $content_url) 

sha=$(echo "$response" | tr -d "\n\r" | jq -r '.sha')
content=$(echo "$response" | tr -d "\n\r" | jq -r '.content')

# base64 -i (ignores garbage like newlines)
base64_content=$(echo $content | base64 -di | sed "s/https:\/\/github\.com\/cloud-annotations\/training\/archive\/v[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.tar\.gz/https:\/\/github.com\/cloud-annotations\/training\/archive\/${TRAVIS_TAG}.tar.gz/g" | base64 | tr -d "\n\r")

sha256=$(curl -fLs https://github.com/cloud-annotations/training/archive/${TRAVIS_TAG}.tar.gz | shasum -a 256 | cut -d ' ' -f 1)
base64_content=$(echo $base64_content | base64 -di | sed "s/sha256 \".*\"/sha256 \"${sha256}\"/g" | base64 | tr -d "\n\r")

# Upload new cacli homebrew formula
content_params="{\"message\":\"version_bump\",\"content\":\"$base64_content\",\"sha\":\"$sha\"}"

echo $content_params

curl -sX PUT "Content-Type: application/json" -d $content_params $content_url