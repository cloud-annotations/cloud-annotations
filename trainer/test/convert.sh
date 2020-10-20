#!/bin/bash

TYPE=$1

pip install --user Cython contextlib2 matplotlib
pip install --user --no-deps -r requirements.txt

python -m convert.convert \
  --model-type=$TYPE \
  --coreml --tflite --tfjs \
  --saved-model=/result_dir/model \
  --mlmodel-path=model_ios \
  --tflite-path=model_android \
  --tfjs-path=model_web


FILE=model_ios/Model.mlmodel
if [ -f "$FILE" ]; then
  echo "✅ Core ML"
else 
  echo "❌ Core ML"
fi

FILE=model_android/model.tflite
if [ -f "$FILE" ]; then
  echo "✅ TensorFlow Lite"
else 
  echo "❌ TensorFlow Lite"
fi

FILE=model_web/model.json
if [ -f "$FILE" ]; then
  echo "✅ TensorFlow.js"
else 
  echo "❌ TensorFlow.js"
fi


# Fail....
FILE=model_ios/Model.mlmodel
if [ ! -f "$FILE" ]; then
  exit 1
fi

FILE=model_android/model.tflite
if [ ! -f "$FILE" ]; then
  exit 1
fi

FILE=model_web/model.json
if [ ! -f "$FILE" ]; then
  exit 1
fi