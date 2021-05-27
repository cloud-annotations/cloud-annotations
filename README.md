# Cloud Annotations
[![GoDoc](https://godoc.org/github.com/cloud-annotations/training/cacli?status.svg)](https://godoc.org/github.com/cloud-annotations/training/cacli)
[![Build Status](https://img.shields.io/travis/cloud-annotations/training/master.svg)](https://travis-ci.org/cloud-annotations/training)

![](https://github.com/cloud-annotations/training/raw/master/docs/_workshops/object-detection/assets/main.png)

## Before you begin

To train a model you should already have labeled images in the [Cloud Annotations online tool](https://cloud.annotations.ai/). For an in-depth guide on this process, check out the following links:

- [Training a Classification Model](https://cloud.annotations.ai/workshops/classification/) – How to train your own model to label images on IBM Cloud.
- [Training an Object Detection Model](https://cloud.annotations.ai/workshops/object-detection/) – How to train your own model to find objects in an image on IBM Cloud.

If something doesn’t work, please [file an issue](https://github.com/cloud-annotations/training/issues/new).



# Iris

## Development

### Setup

```sh
git clone git@github.com:cloud-annotations/iris.git
cd iris

make install
```

### Build & Watch the Frontend

```sh
make watch
```

### Run the backend

Open a directory with `Iris` project folders

```sh
node <path-to-repo>/iris/dist/index.js
```

### CLI

```
IRIS_ROOT=<path-to-repo>
$IRIS_ROOT/cli/bin/index.js start -w --irisRoot $IRIS_ROOT
```
