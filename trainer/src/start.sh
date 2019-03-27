#!/bin/bash

# exit when any command fails
set -e

pip install --user --no-deps -r requirements.txt

SCRIPT="python - << EOF
import sys
import os
import json
from subprocess import call
with open(os.path.join(os.environ['DATA_DIR'], '_annotations.json')) as f:
    print(json.load(f)['type'])
EOF"

TYPE=$(eval "$SCRIPT")

if [ $TYPE = "localization" ]; then
export PYTHONPATH=${PWD}/object_detection/slim
python -m data.prepare_data_object_detection
python -m object_detection.model_main \
  --pipeline_config_path=${RESULT_DIR}/pipeline.config \
  --model_dir=${RESULT_DIR}/checkpoint \
  --num_train_steps=$1 \
  --log_step_count_steps=1 \
  --alsologtostderr
python -m quick_export_graph --result_base=${RESULT_DIR} --model_dir=${RESULT_DIR}/model
else
python -m data.prepare_data_classification
python -m classification.retrain \
  --image_dir=${RESULT_DIR}/data \
  --saved_model_dir=${RESULT_DIR}/model/saved_model \
  --tfhub_module=https://tfhub.dev/google/imagenet/mobilenet_v1_100_224/feature_vector/1 \
  --how_many_training_steps=$1 \
  --output_labels=${RESULT_DIR}/model/labels.txt
fi

echo training success
python -m convert.convert --tfjs --coreml --tflite \
  --tfjs-path=${RESULT_DIR}/model_web \
  --mlmodel-path=${RESULT_DIR}/model_ios \
  --tflite-path=${RESULT_DIR}/model_android \
  --exported-graph-path=${RESULT_DIR}/model