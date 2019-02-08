# Object Detection Training
![](https://bourdakos1.github.io/tfjs-object-detection-training/assets/main.png)

### Walkthrough for training locally:
- [bourdakos1.github.io/tfjs-object-detection-training](https://bourdakos1.github.io/tfjs-object-detection-training/)
### Walkthrough for training on IBM Cloud:
- [bourdakos1.github.io/tfjs-object-detection-training/wml](https://bourdakos1.github.io/tfjs-object-detection-training/wml/)

### Quick & Dirty commands
```
git clone https://github.com/bourdakos1/tfjs-object-detection-training.git &&
cd tfjs-object-detection-training
```

```
svn export -r 8436 https://github.com/tensorflow/models/trunk/research/object_detection &&
svn export -r 8436 https://github.com/tensorflow/models/trunk/research/slim
```

```
svn export -r 308 https://github.com/tensorflow/hub/trunk/examples/image_retraining classification
```

```
python -m bucket.login
```

```
pip install -r requirements.txt
```

```
protoc object_detection/protos/*.proto --python_out=.
```

```
python -m bucket.download
```

```
export PYTHONPATH=$PYTHONPATH:`pwd`/slim
python -m object_detection.model_main \
  --pipeline_config_path=.tmp/pipeline.config \
  --model_dir=.tmp/checkpoint
  --num_train_steps=500 &&
python -m scripts.quick_export_graph
```

```
python -m classification.retrain \
  --image_dir=.tmp/data \
  --saved_model_dir=exported_graph/saved_model \
  --tfhub_module=https://tfhub.dev/google/imagenet/mobilenet_v1_100_224/feature_vector/1 \
  --how_many_training_steps=500 \
  --output_labels=.tmp/output_labels.txt
```

```
python -m scripts.convert --tfjs --tflite --coreml
```

