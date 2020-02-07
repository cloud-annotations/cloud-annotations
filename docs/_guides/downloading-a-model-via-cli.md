---
title: Downloading a model via CLI
date: 1970-01-18
---

With the Cloud Annotations CLI [installed](#installing-the-cloud-annotations-cli-cacli), we will download our trained model. First we need the model ID. This can be obtained by running `cacli list` to list all training runs, find the ID of the model that you would like to download. Then run:

`cacli download <model id>`.