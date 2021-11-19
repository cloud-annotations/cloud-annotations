#!/bin/bash

trap 'echo "The deployment was aborted. Message -- "; exit 1' ERR

# Log in
echo "Logging in..."
ibmcloud config --check-version=false
ibmcloud login -a https://cloud.ibm.com -r us-east -g prod
ibmcloud cr region-set us-south
ibmcloud cr login

# Download cluster config
echo Downloading config for $CLUSTER_ID ...
ibmcloud ks cluster config --cluster $CLUSTER_ID

# Build image
echo Building $IMAGE_NAME ...
docker build -t $IMAGE_NAME .
docker push $IMAGE_NAME

# Apply kubernetes yamls
echo Container build completed, updating $DEPLOYMENT ...
sed -i "s,\(^.*image: \)\(.*$\),\1"$IMAGE_NAME"," k8s/docs.yaml
kubectl apply -f k8s

echo "Deployment complete"
