#!/bin/bash

source ./.env

GH_API="https://api.github.com"
GH_OWNER="cloud-annotations"
REPO="training"
GH_REPO="$GH_API/repos/$GH_OWNER/$REPO/releases?access_token=$GH_ACCESS_TOKEN"

RELEASE_JSON=$(printf '{"tag_name": "v%s"}' "$1")
echo "Creating a release with info: $RELEASE_JSON."

release_id="$(curl --data "$RELEASE_JSON" $GH_REPO | python -c "import sys, json; print json.load(sys.stdin)['id']")"

# exit script if GitHub release was not successfully created
if [ -z "$release_id" ]
then
  echo "Failed to create GitHub release. Exiting with error."
  exit 1
else
  echo "Release created with id: $release_id."
fi

filename='./trainer/training.zip'

GH_ASSET="https://uploads.github.com/repos/$GH_OWNER/$REPO/releases/$release_id/assets?name=$(basename "$filename")&access_token=$GH_ACCESS_TOKEN"
curl --data-binary @"$filename" -H "Content-Type: application/octet-stream" "$GH_ASSET"

echo "Release successful!"
exit 0