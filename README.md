# Cloud Annotations
[![GoDoc](https://godoc.org/github.com/cloud-annotations/training/cacli?status.svg)](https://godoc.org/github.com/cloud-annotations/training/cacli)
[![Build Status](https://img.shields.io/travis/cloud-annotations/training/master.svg)](https://travis-ci.org/cloud-annotations/training)

> 🚨**IMPORTANT** 🚨 The NPM version of cacli is officially no longer supported. Please use the new installation instructions below. 

![](https://github.com/cloud-annotations/training/raw/master/docs/_object_detection/assets/main.png)

## Before you begin

The Cloud Annotations CLI requires you to already have labeled images in the [Cloud Annotations online tool](https://cloud.annotations.ai/). For an in-depth guide on this process, check out the following links:

- [Training a Classification Model](https://cloud.annotations.ai/workshops/classification/) – How to train your own model to label images on IBM Cloud.
- [Training an Object Detection Model](https://cloud.annotations.ai/workshops/object-detection/) – How to train your own model to find objects in an image on IBM Cloud.

Cloud Annotations CLI should work on macOS, Windows, and Linux.<br>
If something doesn’t work, please [file an issue](https://github.com/cloud-annotations/training/issues/new).

## Installation
#### Homebrew (macOS)
If you are on macOS and using [Homebrew](https://brew.sh/), you can install `cacli` with the following:
```bash
$ brew install cacli
```

#### Shell script (Linux / macOS)
If you are on Linux or macOS, you can install `cacli` with the following:
```bash
$ curl -sSL https://cloud.annotations.ai/install.sh | sh
```

#### Windows
1. Download the [binary](https://github.com/cloud-annotations/training/releases/latest/download/cacli_windows_x86_64.exe).
1. Rename it to `cacli.exe`.
1. `cd` to the directory where it was downloaded.
1. Run `cacli --version` to check that it's working.

> **(Optional)** Add cacli.exe to your `PATH` to access it from any location. 

#### Binary
Download the appropriate version for your platform from the [releases page](https://github.com/cloud-annotations/training/releases). Once downloaded, the binary can be run from anywhere. You don't need to install it into a global location. This works well for shared hosts and other systems where you don't have a privileged account.

Ideally, you should install it somewhere in your `PATH` for easy use. `/usr/local/bin` is the most probable location.

## NPM Installation (deprecated)

> **Note:** The npm installation is deprecated and no longer supported.
