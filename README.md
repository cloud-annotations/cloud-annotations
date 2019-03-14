# Cloud Annotations Training
![](https://cloud-annotations.github.io/training/object-detection/assets/main.png)

## Object detection walkthroughs
### [Training a model locally](https://cloud-annotations.github.io/training/object-detection/)
### [Training a model on IBM Cloud](https://cloud-annotations.github.io/training/object-detection/wml/)
### [Training a model on IBM Cloud with CLI](https://cloud-annotations.github.io/training/object-detection/cli/)

## Classification walkthroughs
### [Training a model locally](https://cloud-annotations.github.io/training/classification/)
### [Training a model on IBM Cloud](https://cloud-annotations.github.io/training/classification/wml/)

## Quick & Dirty commands
It's recommended to go through one of the above walkthroughs, but if you already have and just need to remember one of the commands, here they are:

### Project setup
```
git clone https://github.com/cloud-annotations/training.git &&
cd training
```

```
python setup.py all
```

### Training locally
```
python -m local.login
```
```
python -m local.start_training_run
```

### Training on IBM Cloud
```
python -m wml.login
```
```
python -m wml.start_training_run
```
