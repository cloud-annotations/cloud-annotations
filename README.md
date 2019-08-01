# Cloud Annotations
[![NPM Version](https://img.shields.io/npm/v/cloud-annotations.svg)](https://npmjs.org/package/cloud-annotations)
[![NPM Downloads](https://img.shields.io/npm/dm/cloud-annotations.svg)](https://npmjs.org/package/cloud-annotations)
[![Build Status](https://img.shields.io/travis/cloud-annotations/training/master.svg)](https://travis-ci.org/cloud-annotations/training)
[![Coverage Status](https://img.shields.io/coveralls/cloud-annotations/training/master.svg)](https://coveralls.io/github/cloud-annotations/training?branch=master)

**🚨IMPORTANT🚨** Watson Machine Learning recently changed their credential system to use apikeys. Please update to `cacli v1.1.6` 

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
│ version 1.1.5               │
└─────────────────────────────┘

Usage: cacli <command>

where <command> is one of:
  init         Interactively create a config.yaml file
  train        Start a training run
  logs         Monitor the logs of a training run
  progress     Monitor the progress of a training run
  list         List all training runs
  download     Download a trained model
  export       Export files from Bucket

cacli <cmd> -h     quick help on <cmd>
```
