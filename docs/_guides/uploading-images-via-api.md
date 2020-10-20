---
title: Uploading images/labels via API
# date: 1970-01-06
---

Cloud Annotations is built on top of Cloud Object Storage (COS).
Any images located inside your bucket will be visible from the Cloud Annotation GUI.
Additionally, a file named `_annotations.json` located at the root of your bucket is responsible for all annotation metadata.

For full COS documentation, see [IBM Cloud Docs](https://cloud.ibm.com/docs/cloud-object-storage){:target="_blank"}.

## Example annotation file
The following is an example of the annotation file for an object detection project.
There is one image, `image1.jpg`, with two bounding boxes (1 cat + 1 dog).

```
{
  "version": "1.0",
  "type": "localization",
  "labels": ["Cat", "Dog"],
  "annotations": {
    "image1.jpg": [
      {
        "x": 0.7255949630314233,
        "x2": 0.9695875693160814,
        "y": 0.5820120073891626,
        "y2": 1,
        "label": "Cat"
      },
      {
        "x": 0.8845598428835489,
        "x2": 1,
        "y": 0.1829972290640394,
        "y2": 0.966248460591133,
        "label": "Dog"
      }
    ]
  }
}
```

> **Note:** The `_annotations.json` for classification projects will look identical minus the bounding box coordinates.


## Uploading a file with curl
Retreive an `access_token` from your IAM credentials:
<pre>
curl -X POST "https://iam.cloud.ibm.com/identity/token" \
  -d "response_type=cloud_iam" \
  -d "grant_type=urn:ibm:params:oauth:grant-type:apikey" \
  -d "apikey=<b>APIKEY</b>"
</pre>

Upload a file:
<pre>
curl -X PUT "https://s3.us.cloud-object-storage.appdomain.cloud/<b>BUCKET</b>/<b>FILE_NAME</b>" \
  -H "Authorization: bearer <b>ACCESS_TOKEN</b>" \
  -T "<b>PATH/TO/A/FILE</b>"
</pre>

## Object Storage SDKs and CLI
- [Python SDK](https://github.com/ibm/ibm-cos-sdk-python){:target="_blank"}
- [Node.js SDK](https://github.com/IBM/ibm-cos-sdk-js){:target="_blank"}
- [Go SDK](https://github.com/IBM/ibm-cos-sdk-go){:target="_blank"}
- [Java SDK](https://github.com/ibm/ibm-cos-sdk-java){:target="_blank"}
- [AWS CLI](https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-aws-cli){:target="_blank"}