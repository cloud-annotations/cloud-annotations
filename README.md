# Cloud Annotations CLI
[![NPM Version](https://img.shields.io/npm/v/cloud-annotations.svg)](https://npmjs.org/package/cloud-annotations) [![NPM Downloads](https://img.shields.io/npm/dm/cloud-annotations.svg)](https://npmjs.org/package/cloud-annotations)


![](https://cloud-annotations.github.io/training/object-detection/assets/main.png)

## Installation

```bash
$ npm install -g cloud-annotations
```

## Before you begin

The Cloud Annotations CLI requires you to already have labeled images in the [Cloud Annotations online tool](https://cloud.annotations.ai/). For an in-depth guide on this process, check out the following links:

- [Training a Classification Model](https://cloud-annotations.github.io/training/classification/cli/) – How to train your own model to label images on IBM Cloud.
- [Training an Object Detection Model](https://cloud-annotations.github.io/training/object-detection/cli/) – How to train your own model to find objects in an image on IBM Cloud.

Cloud Annotations CLI should work on macOS, Windows, and Linux.<br>
If something doesn’t work, please [file an issue](https://github.com/cloud-annotations/training/issues/new).

## Usage
```bash
$ cacli
┌─────────────────────────────┐
│ (C)loud (A)nnotations (CLI) │
│ version 1.0.9               │
└─────────────────────────────┘

Usage: cacli <command>

where <command> is one of:
  init         Interactively create a config.yaml file
  train        Start a training run
  logs         Monitor the logs of a training run
  progress     Monitor the progress of a training run
  list         List all training runs
  download     Download a trained model

cacli <cmd> -h     quick help on <cmd>
```
