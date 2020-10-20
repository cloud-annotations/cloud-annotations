---
title: Preparing training data
order: 1
---

Cloud Annotations makes labeling images and training machine learning models easy.
Whether you’ve never touched a line of code in your life or you’re a TensorFlow ninja, these docs will help you build what you need.
Let’s get started!

## Sign up for [IBM Cloud](https://ibm.biz/cloud-annotations-sign-up){:target="\_blank"}

Cloud Annotations is built on top of IBM Cloud Object Storage.
Using a cloud object storage offering provides a reliable place to store training data.
It also opens up the potential for collaboration, letting a team to simultaneously annotate the dataset in real-time.

IBM Cloud offers a lite tier of object storage, which includes 25 GB of free storage.

Before you start, sign up for a free [IBM Cloud](https://ibm.biz/cloud-annotations-dashboard){:target="\_blank"} account.

## Training data best practices

To train a computer vision model you need a lot of images.
Cloud Annotations supports uploading both photos and videos.
However, before you start snapping, there's a few limitations to consider.

<!-- markdown list doesn't support include -->
<ul>
  <li>
    <p>
      <strong>Object Type</strong> The model is optimized for photographs of objects in the real world. They are unlikely to work well for x-rays, hand drawings, scanned documents, receipts, etc.
    </p>
  </li>
  <li>
    <p>
      <strong>Object Environment</strong> The training data should be as close as possible to the data on which predictions are to be made. For example, if your use case involves blurry and low-resolution images (such as from a security camera), your training data should be composed of blurry, low-resolution images. In general, you should also consider providing multiple angles, resolutions, and backgrounds for your training images.
    </p>
  </li>
  <li>
    <p>
      <strong>Difficulty</strong> The model generally can't predict labels that humans can't assign. So, if a human can't be trained to assign labels by looking at the image for 1-2 seconds, the model likely can't be trained to do it either.
    </p>
  </li>
  <li>
    <p>
      <strong>Label Count</strong> We recommend at least 50 labels per object category for a usable model, but using 100s or 1000s would provide better results.
    </p>
  </li>
  <li>
    <p>
      <strong>Image Dimensions</strong> The model resizes the image to 300x300 pixels, so keep that in mind when training the model with images where one dimension is much longer than the other.
      {% include responsive.html image="shrink_image.png" %}
    </p>
  </li>
  <li>
    <p>
      <strong>Object Size</strong> The object of interests size should be at least ~5% of the image area to be detected. For example, on the resized 300x300 pixel image the object should cover ~60x60 pixels.
      {% include responsive.html image="small_image.png" %}
    </p>
  </li>
</ul>

## Set up Cloud Annotations

To use Cloud Annotations just navigate to [cloud.annotations.ai](https://cloud.annotations.ai) and click **Continue with IBM Cloud**.

{% include responsive.html image="0a.CA_login.png" %}

Once logged, if you don't have an object storage instance, it will prompt you to create one. Click **Get started** to be directed to IBM Cloud, where you can create a free object storage instance.

{% include responsive.html image="1a.CA_no-object-storage.png" %}

You might need to re-login to IBM Cloud to create a resource.

{% include responsive.html image="2a.IBM_login-to-create-resource.png" %}

Choose a pricing plan and click **Create**, then **Confirm** on the following popup.

{% include responsive.html image="3a.IBM_create-object-storage.png" %}

Once your object storage instance has been provisioned, navigate back to [cloud.annotations.ai](https://cloud.annotations.ai) and refresh the page.

The files and annotations will be stored in a **bucket**, You can create one by clicking **Start a new project**.

{% include responsive.html image="4a.CA_create-bucket.png" %}

Give the bucket a unique name.

{% include responsive.html image="5.CA_name-bucket.png" %}

After your bucket is created and named, it will prompt you to choose an annotation type. Choose `Classification`.

{% include responsive.html image="6a.CA_set-type-classification.png" %}

## Labeling the data

<!-- markdown list doesn't support include -->
<ol>
  <li>Create the desired labels
  {% include responsive.html image="create-label-button.png" %}
  </li>
  <li>Upload a video or some images
  {% include responsive.html image="upload-media-classification.png" %}
  </li>
  <li>Select images then choose <code class="highlighter-rouge">Label</code> > <code class="highlighter-rouge">DESIRED_LABEL</code>
  {% include responsive.html image="label-donuts.png" %}
  </li>
</ol>

## &nbsp;

> **📁 [Sample Training Data](https://github.com/cloud-annotations/training/releases/download/v1.2.30/coffee-donuts.zip)**
