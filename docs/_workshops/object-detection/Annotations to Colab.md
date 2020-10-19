
---
title: Training a Model
order: 6
redirect_from:
  - /object-detection/cli/6.html
---
After we have collected and labeled our first round of images, we are ready to start training our model! 

## Prepare to Export to Colab
There are no additional installations you need to make.

#### Training with Google Colab
> "[Google] Colaboratory, or "Colab" for short, allows you to write and execute Python in your browser..."

We're using it to provide a preconfigured environment to allow you to train your model for free.


There's a button on the top right of your screen that says `Train in Colab`. Click that to get started.
![Train Button](docs/_workshops/object-detection/assets/colab_training_button.png)

#### Copy Credentials
A popup will appear with necessary credentials for access to your bucket. Click to copy those.
![Credentials](docs/_workshops/object-detection/assets/colab_credentials.png)

#### Paste those values in Colab
Paste the values copied from the last step into the first cell of the Colab notebook. They are what gives Colab the access to your images which allows them to be processed through your Cloud Object Storage bucket.
![Colab Snapshot](docs/_workshops/object-detection/assets/colab_snapshot.png)


#### Run the Notebook
Use Shit + Enter to run through the cells of the Notebook.
