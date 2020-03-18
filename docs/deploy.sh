#!/bin/bash

trap 'echo "The deployment was aborted. Message -- "; exit 1' ERR

CLUSTER="bpnvi8vw0nkktonrr20g"
IMAGE_NAME="us.icr.io/cloud-annotations/docs:$(git rev-parse HEAD)"

# Log in
echo "Logging in..."
ibmcloud config --check-version=false
ibmcloud login -a cloud.ibm.com -r us-east -g prod

# Download cluster config
echo Downloading config for $CLUSTER ...
eval $(ibmcloud ks cluster config --cluster $CLUSTER | grep "export KUBECONFIG")

# Build image
echo Building $IMAGE_NAME ...
ibmcloud cr build --no-cache --pull -t $IMAGE_NAME .

# Apply kubernetes yamls
echo Container build completed, updating $DEPLOYMENT ...
sed -i "s,\(^.*image: \)\(.*$\),\1"$IMAGE_NAME"," k8s/docs.yaml
kubectl apply -f k8s -n prod
kubectl apply -f k8s -n stage

echo "Deployment complete"