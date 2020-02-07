---
title: Training via GUI
# date: 1970-01-11
---

First upload your training photos (either photos or video files which will import frames as photos). Either drag and drop into the center, or select an option from the **file** menu.
![](/assets/images/upload_training.png)
![](/assets/images/upload_alt.png)

Once your training data has been uploaded, create a new object label. To do so, double click on the label menu, type your new label name, then hit enter.
![](/assets/images/new_label.png)

Now, label the objects in the images. First select the correct label, then drag a bounding box around the cooresponding object.
![](/assets/images/label_images.png)

Once you have labeled a sufficient amount of photos, click **Train Model**. A dialog message will appear, prompting you to select your Watson Machine Learning instance. If none are available, it will guide you to create a new one (You may need to refresh your Cloud Annotations window for the new instance to appear, but don't worry, your labels will be saved).
![](/assets/images/wml_dialog.png)

Click **Train**. Your training job will not be added to the queue.
![](/assets/images/training_queue.png)

You will see it listed as *pending* until the training starts (this could take several minutes).
![](/assets/images/pending_training.png)

Once your training job starts, the status will change and you will see a graph of the training steps running.
![](/assets/images/training_steps.png)

Once the job is completed, you're all set!