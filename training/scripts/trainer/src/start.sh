#!/bin/bash

trap 'echo CACLI-TRAINING-FAILED; exit 1' ERR

pip install --user Cython contextlib2 matplotlib
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

PIPELINE_CONFIG_PATH=pipeline.config
TMP_OUTPUT_DIRECTORY=${RESULT_DIR}/_model
OUTPUT_DIRECTORY=${RESULT_DIR}/model
OUTPUT_LABEL_PATH=${OUTPUT_DIRECTORY}/labels.json
CHECKPOINT_PATH=${RESULT_DIR}/checkpoints
LABEL_MAP_PATH=data/label_map.pbtxt

if [ $TYPE = "localization" ]; then
echo '/////////////////////////////'
echo '//  Training Localization  //'
echo '/////////////////////////////'
export PYTHONPATH=${PWD}/object_detection/slim
python -m data.prepare_data_object_detection
python -m object_detection.model_main \
  --pipeline_config_path=$PIPELINE_CONFIG_PATH \
  --model_dir=$CHECKPOINT_PATH \
  --num_train_steps=$1 \
  --log_step_count_steps=1 \
  --alsologtostderr

TRAINED_CHECKPOINT_PREFIX=$(python -m get_latest_checkpoint \
  --checkpoint_path=$CHECKPOINT_PATH)

python -m object_detection.export_inference_graph \
  --pipeline_config_path=$PIPELINE_CONFIG_PATH \
  --trained_checkpoint_prefix=$TRAINED_CHECKPOINT_PREFIX \
  --output_directory=$TMP_OUTPUT_DIRECTORY

cp -r $TMP_OUTPUT_DIRECTORY/saved_model/. $OUTPUT_DIRECTORY

python -m export_labels \
  --label_map_path=$LABEL_MAP_PATH \
  --output_label_path=$OUTPUT_LABEL_PATH
else
echo '/////////////////////////////'
echo '// Training classification //'
echo '/////////////////////////////'
python -m data.prepare_data_classification
python -m classification.retrain \
  --image_dir=data \
  --saved_model_dir=$OUTPUT_DIRECTORY \
  --tfhub_module=https://tfhub.dev/google/imagenet/mobilenet_v1_100_224/feature_vector/1 \
  --validation_percentage=20 \
  --how_many_training_steps=$1 \
  --output_labels=labels.txt
mv labels.txt $OUTPUT_DIRECTORY
fi

echo 'CACLI-TRAINING-SUCCESS'

# Don't crash for failed conversion.
trap 'echo CACLI-CONVERSION-FAILED; exit 0' ERR

python -m convert.convert \
  --model-type=$TYPE \
  --coreml --tflite --tfjs \
  --saved-model=$OUTPUT_DIRECTORY \
  --mlmodel-path=${RESULT_DIR}/model_ios \
  --tflite-path=${RESULT_DIR}/model_android \
  --tfjs-path=${RESULT_DIR}/model_web
  

border () {
  local str="$*"
  local len=${#str}
  local i
  printf '┌─'
  for (( i = 0; i < len; ++i )); do
      printf '─'
  done
  printf '─┐'
  printf "\n│ $str │\n"
  printf '└─'
  for (( i = 0; i < len; ++i )); do
      printf '─'
  done
  printf '─┘'
  echo
}

echo ""
echo "Output files stored in: "
border $(basename ${RESULT_DIR})
echo ""