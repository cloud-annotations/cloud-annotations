#!/bin/bash

python -m convert \
  --coreml --tflite --tfjs \
  --saved-model=/home/iris/trainer/result_dir/model \
  --mlmodel-path=/home/iris/trainer/result_dir/model_ios \
  --tflite-path=/home/iris/trainer/result_dir/model_android \
  --tfjs-path=/home/iris/trainer/result_dir/model_web


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