#!/bin/bash

if [ "$DEPLOY_TO" = "production" ]
then
  # PRODUCTION:
  echo "Deploying to PRODUCTION..."
  CLUSTER="annotations"
  URL="https://${CLUSTER}.us-east.containers.appdomain.cloud"
else
  # STAGING:
  echo "Deploying to STAGING..."
  CLUSTER="staging.annotations"
  URL="https://stagingannotations.us-east.containers.appdomain.cloud"
fi


IMAGE_NAME="us.icr.io/bourdakos1/docs:$(git rev-parse HEAD)"

function fail {
  echo $1 >&2
  exit 1
}

trap 'fail "The deployment was aborted. Message -- "' ERR

function configure {
  echo "Validating configuration..."
  [ ! -z "$CLUSTER" ] || fail "Configuration option is not set: CLUSTER"
  [ ! -z "$IMAGE_NAME" ] || fail "Configuration option is not set: IMAGE_NAME"
  
  ibmcloud config --check-version=false
  ibmcloud login -r us-east
}

function download_config {
  echo Downloading config for $CLUSTER ...
  CONFIG="$(ibmcloud ks cluster config $CLUSTER)"
  CONFIG=${CONFIG##*export KUBECONFIG=}
  CONFIG=${CONFIG%%.yml*}
  export KUBECONFIG=$CONFIG.yml
}

function attempt_build {
  echo Building $IMAGE_NAME ...
  ibmcloud cr build --no-cache --pull -t $IMAGE_NAME .
  # ibmcloud cr build -t $IMAGE_NAME .
}

function set_image {
  echo Container build completed, updating $DEPLOYMENT ...
  ls
  sed -i '' "s,\(^.*image: \)\(.*$\),\1"$IMAGE_NAME"," "./k8s/docs.yaml"
  kubectl apply -f k8s
}

configure
download_config
attempt_build
set_image
echo "Deployment complete"
