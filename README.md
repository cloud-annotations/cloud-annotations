# tfjs-object-detection-training

* Label the images

Clone and change directories into my repo:
```
git clone https://github.com/bourdakos1/tfjs-object-detection-training.git
cd tfjs-object-detection-training
```

Download the TensorFlow Object Detection API:
```
svn export -r 8436 https://github.com/tensorflow/models/trunk/research/object_detection &&
svn export -r 8436 https://github.com/tensorflow/models/trunk/research/slim
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

Download your training data:
```
python -m bucket.download
```

Set your python path:
```
export PYTHONPATH=$PYTHONPATH:`pwd`/slim
```

Train the model:
```
python -m object_detection.model_main \
    --pipeline_config_path=.tmp/pipeline.config \
    --model_dir=.tmp/checkpoint
```

Export the model:
```
python -m quick_export_graph
```

Convert the model:
```
tensorflowjs_converter \
    --input_format=tf_saved_model \
    --output_node_names='num_detections,detection_boxes,detection_scores,detection_classes' \
    exported_graph/saved_model \
    web_model
```