# Cloud Annotations Training
![](https://cloud-annotations.github.io/training/object-detection/assets/main.png)

## Installation

```bash
$ npm install -g cloud-annotations
```

## Documentation

Training a model:
* [Tutorial](https://cloud-annotations.github.io/training/object-detection/cli/)

## Usage

```bash
$ cacli train
```

## Building from source and training locally



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
