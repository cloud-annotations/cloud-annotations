# Cloud Annotations
[![NPM Version](https://img.shields.io/npm/v/cloud-annotations.svg)](https://npmjs.org/package/cloud-annotations)
[![NPM Downloads](https://img.shields.io/npm/dm/cloud-annotations.svg)](https://npmjs.org/package/cloud-annotations)
[![Build Status](https://img.shields.io/travis/cloud-annotations/training/master.svg)](https://travis-ci.org/cloud-annotations/training)
[![Coverage Status](https://img.shields.io/coveralls/cloud-annotations/training/master.svg)](https://coveralls.io/github/cloud-annotations/training?branch=master)

![](https://github.com/cloud-annotations/training/raw/master/docs/_object_detection/assets/main.png)

## Before you begin

The Cloud Annotations CLI requires you to already have labeled images in the [Cloud Annotations online tool](https://cloud.annotations.ai/). For an in-depth guide on this process, check out the following links:

- [Training a Classification Model](https://cloud-annotations.github.io/training/classification/cli/) – How to train your own model to label images on IBM Cloud.
- [Training an Object Detection Model](https://cloud-annotations.github.io/training/object-detection/cli/) – How to train your own model to find objects in an image on IBM Cloud.

Cloud Annotations CLI should work on macOS, Windows, and Linux.<br>
If something doesn’t work, please [file an issue](https://github.com/cloud-annotations/training/issues/new).

## Installation

```bash
$ npm install -g cloud-annotations
```

## Installation (beta)
#### Homebrew (macOS)
If you are on macOS and using [Homebrew](https://brew.sh/), you can install `cacli` with the following:
```bash
$ brew install cloud-annotations/tap/cacli
```

#### Shell script (Linux / macOS)
If you are on Linux or macOS, you can install `cacli` with the following:
```bash
$ curl -sSL https://cloud.annotations.ai/install.sh | sudo sh
```

#### Binary (Windows / Linux / macOS)
Download the appropriate version for your platform from the [releases page](https://github.com/cloud-annotations/training/releases). Once downloaded, the binary can be run from anywhere. You don't need to install it into a global location. This works well for shared hosts and other systems where you don't have a privileged account.

Ideally, you should install it somewhere in your `PATH` for easy use. `/usr/local/bin` is the most probable location.
