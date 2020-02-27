---
title: Installing the CLI
# date: 1970-01-12
---

To train our model we need to install the Cloud Annotation CLI.

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
1. Download the [binary](https://github.com/cloud-annotations/training/releases/download/v1.2.29/cacli_windows_x86_64.exe).
1. Rename it to `cacli.exe`.
1. `cd` to the directory where it was downloaded.
1. Run `cacli --version` to check that it's working.

> **(Optional)** Add cacli.exe to your `PATH` to access it from any location. 

#### Binary
Download the appropriate version for your platform from the [releases page](https://github.com/cloud-annotations/training/releases). Once downloaded, the binary can be run from anywhere. You don't need to install it into a global location. This works well for shared hosts and other systems where you don't have a privileged account.

Ideally, you should install it somewhere in your `PATH` for easy use. `/usr/local/bin` is the most probable location.
