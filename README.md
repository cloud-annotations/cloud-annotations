# Cloud Annotations Training
![](https://cloud-annotations.github.io/training/object-detection/assets/main.png)

## Installation

```bash
$ npm install -g cloud-annotations
```

## Before you begin

The Cloud Annotations CLI requires you to already have labeled images in the [Cloud Annotations online tool](https://annotations.us-east.containers.appdomain.cloud/). For an in-depth guide on this process, check out the following link:

- [Training a Model on IBM Cloud](https://cloud-annotations.github.io/training/object-detection/cli/) – How to label and train your own computer vision model.

Cloud Annotations CLI should work on macOS, Windows, and Linux.<br>
If something doesn’t work, please [file an issue](https://github.com/cloud-annotations/training/issues/new).

## Usage
```bash
$ cacli
┌─────────────────────────────┐
│ (C)loud (A)nnotations (CLI) │
│ version 1.0.2               │
└─────────────────────────────┘

Usage: cacli <command>

where <command> is one of:
  init         Interactively create a config.yaml file
  train        Start a training run
  monitor      Monitor the progress of a training run
  list         List all training runs
  download     Download a trained model

cacli <cmd> -h     quick help on <cmd>
```

## Building from source
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
