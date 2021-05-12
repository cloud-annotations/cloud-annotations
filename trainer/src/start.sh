#!/bin/bash

trap 'echo CACLI-TRAINING-FAILED; exit 1' ERR

pip install -U tensorflowjs

PIPELINE_CONFIG_PATH=pipeline.config
TMP_OUTPUT_DIRECTORY=${RESULT_DIR}/_model
OUTPUT_DIRECTORY=${RESULT_DIR}/model
OUTPUT_LABEL_PATH=${OUTPUT_DIRECTORY}/labels.json
CHECKPOINT_PATH=${RESULT_DIR}/checkpoints
LABEL_MAP_PATH=data/label_map.pbtxt

echo 'Downloading checkpoint...'
python -m download_checkpoint
echo ''

echo 'Preparing data...'
python -m prepare_data
echo ''

echo 'Training...'
python -m train \
  --pipeline_config_path=$PIPELINE_CONFIG_PATH \
  --model_dir=$CHECKPOINT_PATH \
  --num_train_steps=$1
echo ''

echo 'Exporting graph...'
python -m export_graph \
  --pipeline_config_path=$PIPELINE_CONFIG_PATH \
  --trained_checkpoint_dir=$CHECKPOINT_PATH \
  --output_directory=$TMP_OUTPUT_DIRECTORY
echo ''

cp -r $TMP_OUTPUT_DIRECTORY/saved_model/. $OUTPUT_DIRECTORY

echo 'Exporting labels...'
python -m export_labels \
  --label_map_path=$LABEL_MAP_PATH \
  --output_label_path=$OUTPUT_LABEL_PATH
echo ''

# Don't crash for failed conversion.
trap 'echo CACLI-CONVERSION-FAILED; exit 0' ERR

echo 'Converting model...'
python -m convert \
  --coreml --tflite --tfjs \
  --saved-model=$OUTPUT_DIRECTORY \
  --mlmodel-path=${RESULT_DIR}/model_ios \
  --tflite-path=${RESULT_DIR}/model_android \
  --tfjs-path=${RESULT_DIR}/model_web
echo ''  

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