---
title: Training with Google Colab
# date: 1970-01-14
---

Google Colaboratory, or “Colab” for short, is a product from Google Research.
Colab allows anybody to write and execute arbitrary python code through the browser, and is especially well suited to machine learning, data analysis and education.
More technically, Colab is a hosted Jupyter notebook service that requires no setup to use, while providing free access to computing resources including GPUs.

To use Google Colab all you need is a standard Google Account.

> **Note:** These steps assume you have already [labeled a dataset for object detection](#object-detection).

## Exporting annotations
To train a model in Google Colab, it expects the annotations to be located in Google Drive.
You can export your data from Cloud Annotations via the following steps:

1. Choose `File` > `Export as Create ML`

{% include responsive.html image="export-annotations.png" %}

## Uploading to Google Drive
Once exported, you should have a file named `<bucket-name>.zip`.
Unzip the downloaded folder and upload it to [Google Drive](https://drive.google.com/){:target="_blank"}.

{% include responsive.html image="gdrive.png" %}

## Using Google Colab
[Open in Colab](https://colab.research.google.com/github/cloud-annotations/google-colab-training/blob/master/object_detection.ipynb){:target="_blank"}
