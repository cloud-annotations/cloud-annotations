---
title: Preparing training data
date: 1970-01-02
---

To train a computer vision model you need a lot of images.
Cloud Annotations supports uploading both photos and videos.
However, before you start snapping, there's a few limitations to consider.

## Training data best practices
* **Object Type** The model is optimized for photographs of objects in the real world. They are unlikely to work well for x-rays, hand drawings, scanned documents, receipts, etc.

* **Object Environment** The training data should be as close as possible to the data on which predictions are to be made. For example, if your use case involves blurry and low-resolution images (such as from a security camera), your training data should be composed of blurry, low-resolution images. In general, you should also consider providing multiple angles, resolutions, and backgrounds for your training images.

* **Difficulty** The model generally can't predict labels that humans can't assign. So, if a human can't be trained to assign labels by looking at the image for 1-2 seconds, the model likely can't be trained to do it either.

* **Label Count** We recommend at least 50 labels per object category for a usable model, but using 100s or 1000s would provide better results.

* **Image Dimensions** The model resizes the image to 300x300 pixels, so keep that in mind when training the model with images where one dimension is much longer than the other.
![](/docs-assets/images/shrink_image.png)

* **Object Size** The object of interests size should be at least ~5% of the image area to be detected. For example, on the resized 300x300 pixel image the object should cover ~60x60 pixels.
![](/docs-assets/images/small_image.png)


## Set up Cloud Annotations
To use Cloud Annotations just navigate to [cloud.annotations.ai](https://cloud.annotations.ai) and click **Continue with IBM Cloud**.
![](/docs-assets/images/0a.CA_login.png)

Once logged, if you don't have an object storage instance, it will prompt you to create one. Click **Get started** to be directed to IBM Cloud, where you can create a free object storage instance.
![](/docs-assets/images/1a.CA_no-object-storage.png)

You might need to re-login to IBM Cloud to create a resource.
![](/docs-assets/images/2a.IBM_login-to-create-resource.png)

Choose a pricing plan and click **Create**, then **Confirm** on the following popup.
![](/docs-assets/images/3a.IBM_create-object-storage.png)

Once your object storage instance has been provisioned, navigate back to [cloud.annotations.ai](https://cloud.annotations.ai) and refresh the page. 

The files and annotations will be stored in a **bucket**, You can create one by clicking **Start a new project**.
![](/docs-assets/images/4a.CA_create-bucket.png)

Give the bucket a unique name.
![](/docs-assets/images/5.CA_name-bucket.png)

## [Object detection](#object-detection) or [classification](#classification)?
A classification model can tell you what an image is and how confident it is about it's decision.
An object detection model can provide you with much more information:
* **Location** The coordinates and area of where the object is in the image.
* **Count** The number of objects found in the image.
* **Size** How large the object is with respect to the image dimensions.

If an object detection model gives us this extra information, why would we use classification?
* **Labor Cost** An object detection model requires humans to draw boxes around every object to train. A classification model only requires a simple label for each image.
* **Training Cost** It can take longer and require more expensive hardware to train an object detection model.
* **Inference Cost** An object detection model can be much slower than real-time to process an image on low-end hardware.



