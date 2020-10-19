
---
title: Training a Model
order: 6
redirect_from:
  - /object-detection/cli/6.html
---
After we have collected and labeled our first round of images, we are ready to start training our model! 

## Prepare to Export to Colab
To train our model we need to install the Cloud Annotation CLI.

#### Click Train in Colab
There's a green button on the top right of your screen that says "Train in Colab". Click that to get started.
```bash
$ brew install cacli
```

#### Copy Credentials
A popup will appear with necessary credentials for access to your bucket. Click to copy those.
```bash
$ curl -sSL https://cloud.annotations.ai/install.sh | sh
```

#### Paste those values in Colab
Paste the values copied from the last step into the first cell of the Colab notebook.


#### Run the Notebook
Use Shit + Enter to run through the cells of the Notebook.
