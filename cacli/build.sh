#!/bin/bash

# TODO: get a real version
VERSION="1.5.0"

# ldflags "-s -w" strips binary
# ldflags -X injects commit version into binary
CGO_ENABLED=0 GOOS=darwin go build \
  --ldflags "-s -w -X github.com/cloud-annotations/training/cacli/version.Version=${VERSION}" \
  -o bin/cacli-darwin