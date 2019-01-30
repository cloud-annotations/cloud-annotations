from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import os
import io
import json
import random
import hashlib
import uuid
import shutil
import types
import argparse
import tarfile

import six.moves.urllib as urllib
import contextlib2
import PIL.Image
import tensorflow as tf
import pandas as pd
import ibm_boto3
from botocore.client import Config
from dotenv import load_dotenv
load_dotenv('.credentials')

from object_detection.dataset_tools import tf_record_creation_util
from object_detection.utils import dataset_util

parser = argparse.ArgumentParser()
parser.add_argument('--bucket', type=str)
parser.add_argument('--endpoint', type=str)
args = parser.parse_args()

def __iter__(self): return 0
def pandas_support(csv):
    # add missing __iter__ method, so pandas accepts body as file-like object
    if not hasattr(csv, "__iter__"): csv.__iter__ = types.MethodType( __iter__, csv )
    return csv


################################################################################
# Credentials
################################################################################
credentials_1 = {
  'bucket': args.bucket,
  'iam_url': 'https://iam.ng.bluemix.net/oidc/token',
  'api_key': os.getenv('API_KEY'),
  'resource_instance_id': os.getenv('RESOURCE_INSTANCE_ID'),
  'url': args.endpoint or 'https://s3-api.us-geo.objectstorage.softlayer.net'
}


################################################################################
# Initialize Cloud Object Storage
################################################################################
cos = ibm_boto3.resource('s3',
    ibm_api_key_id=credentials_1['api_key'],
    ibm_service_instance_id=credentials_1['resource_instance_id'],
    ibm_auth_endpoint=credentials_1['iam_url'],
    config=Config(signature_version='oauth'),
    endpoint_url=credentials_1['url']
)


################################################################################
# Choose Bucket
################################################################################
def askForBucket():
    bucket_list = []
    for i, bucket in enumerate(cos.buckets.all()):
        bucket_list.append(bucket.name)
        print('  {}) {}'.format(i + 1, bucket.name))

    bucket_id_name = input("Bucket: ")

    if bucket_id_name in bucket_list:
        credentials_1['bucket'] = bucket_id_name
    else:
        try:
           bucket_id_name = int(bucket_id_name)
           if bucket_id_name <= len(bucket_list):
               credentials_1['bucket'] = bucket_list[bucket_id_name - 1]
           else:
               print('\nPlease choose a valid bucket:')
               askForBucket()
        except ValueError:
            print('\nPlease choose a valid bucket:')
            askForBucket()

if credentials_1['bucket'] == None:
    print('\nPlease choose a bucket:')
    askForBucket()


################################################################################
# Prepare Output Directories
################################################################################
def createDir(base, dirName):
    path = os.path.join(base, dirName)
    if os.path.exists(path) and os.path.isdir(path):
        shutil.rmtree(path)
    os.makedirs(path)
    return path

output_dir = '.tmp'
train_dir = createDir(output_dir, 'images')
data_dir = createDir(output_dir, 'data')
checkpoint_dir = createDir(output_dir, 'checkpoint')


################################################################################
# Download Data
################################################################################
annotations = cos.Object(credentials_1['bucket'], '_annotations.json').get()['Body']
annotations = json.load(annotations)['annotations']

labels = list({annotation['label'] for image in annotations.values() for annotation in image})

# Download training images.
image_files = [image for image in annotations.keys()]
for file in image_files:
    filename = os.path.join(train_dir, file)
    print('saving: {}'.format(file))
    print('to: {}'.format(filename))
    cos.Object(credentials_1['bucket'], file).download_file(filename)


################################################################################
# Create LabelMap Proto
################################################################################
label_map_path = os.path.join(data_dir, 'label_map.pbtxt')

with open(label_map_path, 'w') as file:
    for idx, label in enumerate(labels):
        file.write('item {\n')
        file.write('\tname: \'{}\'\n'.format(label))
        file.write('\tid: {}\n'.format(idx + 1)) # indexes must start at 1.
        file.write('}\n')


################################################################################
# Create TF Records
################################################################################
train_shards = 10
val_shards = 10
random.seed(42)
random.shuffle(image_files)
num_train = int(0.7 * len(image_files))
train_examples = image_files[:num_train]
val_examples = image_files[num_train:]
print('{} training and {} validation examples.'.format(len(train_examples), len(val_examples)))

train_output_path = os.path.join(data_dir, 'train.record')
val_output_path = os.path.join(data_dir, 'val.record')

def create_tf_record(output_filename, num_shards, examples):
    with contextlib2.ExitStack() as tf_record_close_stack:
        output_tfrecords = tf_record_creation_util.open_sharded_output_tfrecords(
            tf_record_close_stack,
            output_filename,
            num_shards)
        for idx, example in enumerate(examples):
            img_path = os.path.join(train_dir, example)
            with tf.gfile.GFile(img_path, 'rb') as fid:
                encoded_jpg = fid.read()
            encoded_jpg_io = io.BytesIO(encoded_jpg)
            image = PIL.Image.open(encoded_jpg_io)
            if image.format != 'JPEG':
                raise ValueError('Image format not JPEG')
            key = hashlib.sha256(encoded_jpg).hexdigest()

            width, height = image.size

            xmins = []
            xmaxs = []
            ymins = []
            ymaxs = []
            classes_text = [] # 'coke', 'pepsi', 'coke'...
            classes = [] # 1, 2, 1...
            difficult_obj = []
            truncated = []
            poses = []

            for annotation in annotations[example]:
                xmins.append(annotation['x'])
                xmaxs.append(annotation['x2'])
                ymins.append(annotation['y'])
                ymaxs.append(annotation['y2'])
                classes_text.append(annotation['label'].encode('utf8'))
                classes.append(1) # temporary, I need to assign labels to actual ids
                difficult_obj.append(0)
                truncated.append(0)
                poses.append(''.encode('utf8'))

            try:
                feature_dict = {
                    'image/height': dataset_util.int64_feature(height),
                    'image/width': dataset_util.int64_feature(width),
                    'image/filename': dataset_util.bytes_feature(example.encode('utf8')),
                    'image/source_id': dataset_util.bytes_feature(example.encode('utf8')),
                    'image/key/sha256': dataset_util.bytes_feature(key.encode('utf8')),
                    'image/encoded': dataset_util.bytes_feature(encoded_jpg),
                    'image/format': dataset_util.bytes_feature('jpeg'.encode('utf8')),
                    'image/object/bbox/xmin': dataset_util.float_list_feature(xmins),
                    'image/object/bbox/xmax': dataset_util.float_list_feature(xmaxs),
                    'image/object/bbox/ymin': dataset_util.float_list_feature(ymins),
                    'image/object/bbox/ymax': dataset_util.float_list_feature(ymaxs),
                    'image/object/class/text': dataset_util.bytes_list_feature(classes_text),
                    'image/object/class/label': dataset_util.int64_list_feature(classes),
                    'image/object/difficult': dataset_util.int64_list_feature(difficult_obj),
                    'image/object/truncated': dataset_util.int64_list_feature(truncated),
                    'image/object/view': dataset_util.bytes_list_feature(poses)
                }
                tf_example = tf.train.Example(features=tf.train.Features(feature=feature_dict))
                if tf_example:
                    shard_idx = idx % num_shards
                    output_tfrecords[shard_idx].write(tf_example.SerializeToString())
            except ValueError:
                print('Invalid example, ignoring.')

create_tf_record(train_output_path, train_shards, train_examples)
create_tf_record(val_output_path, val_shards, val_examples)


################################################################################
# Download Model Checkpoint
################################################################################
download_base = 'http://download.tensorflow.org/models/object_detection/'
model_file = 'ssd_mobilenet_v1_coco_2018_01_28.tar.gz'

tar_path = os.path.join(output_dir, model_file)

if not os.path.exists(tar_path):
    print('Downloading model checkpoint...')
    opener = urllib.request.URLopener()
    opener.retrieve(download_base + model_file, tar_path)
else:
    print('Model checkpoint found.')

tar = tarfile.open(tar_path)
for member in tar.getmembers():
    # Flatten the directory.
    member.name = os.path.basename(member.name)
    if 'model.ckpt' in member.name:
        print('Extracting {}...'.format(member.name))
        tar.extract(member, path=checkpoint_dir)


################################################################################
# Create pipeline.config
################################################################################
fill_num_classes = str(len(labels))
fill_label_map = label_map_path
fill_train_record = train_output_path + '-?????-of-{:05}'.format(train_shards)
fill_val_record = val_output_path + '-?????-of-{:05}'.format(val_shards)
fill_checkpoint = os.path.join(checkpoint_dir, 'model.ckpt')

skeleton_path = os.path.join('bucket', 'pipeline_skeleton.config')
pipeline_path = os.path.join(output_dir, 'pipeline.config')

try:
    os.remove(pipeline_path)
except OSError:
    pass

with open(skeleton_path, 'r') as skeleton:
    with open(pipeline_path, 'w') as pipeline:
        for line in skeleton:
            new_line = line.replace('${NUM_CLASSES}', fill_num_classes)
            new_line = new_line.replace('${LABEL_MAP}', fill_label_map)
            new_line = new_line.replace('${TRAIN_RECORD}', fill_train_record)
            new_line = new_line.replace('${VAL_RECORD}', fill_val_record)
            new_line = new_line.replace('${CHECKPOINT}', fill_checkpoint)
            pipeline.write(new_line)