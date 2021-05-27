#!/bin/bash

mkdir data_dir
mkdir result_dir

S3_ID=$1
S3_KEY=$2
BUCKET=$3
STEPS=$4

echo $S3_ID:$S3_KEY > .passwd-s3fs
chmod 600 .passwd-s3fs
s3fs $BUCKET /data_dir -o passwd_file=.passwd-s3fs -o url=https://s3.us.cloud-object-storage.appdomain.cloud/ -o use_path_request_style

export DATA_DIR=/data_dir
export RESULT_DIR=/result_dir

./start.sh $STEPS