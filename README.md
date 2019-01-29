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

Log into your bucket:
```
python -m bucket.login
```

Download your training data:
```
python -m bucket.download
```

Train the model:
```
brew install protobuf

protoc object_detection/protos/*.proto --python_out=.

export PYTHONPATH=$PYTHONPATH:`pwd`:`pwd`/slim

python object_detection/model_main.py \
    --pipeline_config_path=pipeline.config \
    --model_dir=./tmp/checkpoint
```

Export graph:
```
python object_detection/export_inference_graph.py \
    --input_type=image_tensor \
    --pipeline_config_path=sample_pipeline.config \
    --trained_checkpoint_prefix=./tmp/checkpoint/model.ckpt-0 \
    --output_directory=exported_graphs
```

Convert the model:
```
tensorflowjs_converter \
    --input_format=tf_saved_model \
    --output_node_names='num_detections,detection_boxes,detection_scores,detection_classes' \
    exported_graphs/saved_model \
    web_model
```