#!/bin/bash

CORE_ML=$1/model_ios/Model.mlmodel
TF_LITE=$1/model_android/model.tflite
TF_JS=$1/model_web/model.json

if [ -f "$CORE_ML" ]; then
  echo "✅ Core ML"
else 
  echo "❌ Core ML"
fi

if [ -f "$TF_LITE" ]; then
  echo "✅ TensorFlow Lite"
else 
  echo "❌ TensorFlow Lite"
fi

if [ -f "$TF_JS" ]; then
  echo "✅ TensorFlow.js"
else 
  echo "❌ TensorFlow.js"
fi


# Fail....
if [ ! -f "$CORE_ML" ]; then
  exit 1
fi

if [ ! -f "$TF_LITE" ]; then
  exit 1
fi

if [ ! -f "$TF_JS" ]; then
  exit 1
fi