# tfjs-object-detection-training

## Setup
Clone the repo and move inside:
```
git clone https://github.com/bourdakos1/tfjs-object-detection-training.git
cd tfjs-object-detection-training
```

Download the TensorFlow Object Detection API:
```
svn export -r 8436 https://github.com/tensorflow/models/trunk/research/object_detection &&
svn export -r 8436 https://github.com/tensorflow/models/trunk/research/slim
```

Install the requirements:
```
pip install -r requirements.txt
```

Compile the protobufs:
```
brew install protobuf
protoc object_detection/protos/*.proto --python_out=.
```

Log into your bucket:
```
python -m bucket.login
```

## Download Training Data
Run the bucket download script:
```
python -m bucket.download
```

## Train the Model
Set your python path:
```
export PYTHONPATH=$PYTHONPATH:`pwd`/slim
```

Run the training script:
```
python -m object_detection.model_main \
    --pipeline_config_path=.tmp/pipeline.config \
    --model_dir=.tmp/checkpoint
```

> **Note:** Your model will continue to train endlessly. Stop the script by pressing `control + c`, whenever you are satisfied. 

## Export your Model
Run the model export script:
```
python -m quick_export_graph
```

## Convert the Exported Model to TensorFlow.js
Install the TensorFlow.js package:
```
pip install tensorflowjs
```

Run the conversion script:
```
tensorflowjs_converter \
    --input_format=tf_saved_model \
    --output_node_names='num_detections,detection_boxes,detection_scores,detection_classes' \
    exported_graph/saved_model \
    web_model
```