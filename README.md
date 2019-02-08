# Object Detection Training
![](https://bourdakos1.github.io/tfjs-object-detection-training/assets/main.png)

### Walkthrough for training locally:
- [bourdakos1.github.io/tfjs-object-detection-training](https://bourdakos1.github.io/tfjs-object-detection-training/)
### Walkthrough for training on IBM Cloud:
- [bourdakos1.github.io/tfjs-object-detection-training/wml](https://bourdakos1.github.io/tfjs-object-detection-training/wml/)

## Quick & Dirty commands
It's recommended to go through one of the above walkthroughs, but if you already have and just need to remember one of the commands, here they are:

### Project setup
Clone the repo:
```
git clone https://github.com/bourdakos1/tfjs-object-detection-training.git &&
cd tfjs-object-detection-training
```

Download the classification or object detection api:
* classification
  ```
  svn export -r 308 https://github.com/tensorflow/hub/trunk/examples/image_retraining classification
  ```
* object detection
  ```
  svn export -r 8436 https://github.com/tensorflow/models/trunk/research/object_detection &&
  svn export -r 8436 https://github.com/tensorflow/models/trunk/research/slim
  ```

Log into Watson services and final setup:
* training locally
  ```
  python -m bucket.login
  ```
* training on IBM Cloud
  ```
  python -m wml.login
  ```
  * classification
    ```
    python setup_classification.py sdist
    ```
  * object detection
    ```
    python setup_object_detection.py sdist
    ```

### Training locally
Download the data:
```
python -m bucket.download
```

Train:
* classification
  ```
  python -m classification.retrain \
    --image_dir=.tmp/data \
    --saved_model_dir=exported_graph/saved_model \
    --tfhub_module=https://tfhub.dev/google/imagenet/mobilenet_v1_100_224/feature_vector/1 \
    --how_many_training_steps=500 \
    --output_labels=.tmp/output_labels.txt
  ```
* object detection
  ```
  export PYTHONPATH=$PYTHONPATH:`pwd`/slim
  python -m object_detection.model_main \
    --pipeline_config_path=.tmp/pipeline.config \
    --model_dir=.tmp/checkpoint
    --num_train_steps=500 &&
  python -m scripts.quick_export_graph
  ```

### Training on IBM Cloud
Train:
```
python -m scripts.start_training_run
```

### Conversion
Convert to desired format:
```
python -m scripts.convert --tfjs --tflite --coreml
```