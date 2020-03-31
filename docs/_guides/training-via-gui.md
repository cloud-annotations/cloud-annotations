---
title: Training via GUI
# date: 1970-01-11
---

Once you have labeled a sufficient amount of photos, click **Train Model**. A dialog message will appear, prompting you to select your Watson Machine Learning instance. If none are available, it will guide you to create a new one (You may need to refresh your Cloud Annotations window for the new instance to appear, but don't worry, your labels will be saved).

{% include responsive.html image="wml_dialog.png" %}

Click **Train**. Your training job will not be added to the queue.

You will see it listed as *pending* until the training starts (this could take several minutes).

{% include responsive.html image="pending_training.png" %}

Once your training job starts, the status will change and you will see a graph of the training steps running.

{% include responsive.html image="training_steps.png" %}

Once the job is completed, you're all set!