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
