from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import os
import argparse
import shutil

import ibm_boto3
from botocore.client import Config
from watson_machine_learning_client import WatsonMachineLearningAPIClient
from dotenv import load_dotenv
load_dotenv('.credentials')

parser = argparse.ArgumentParser()
parser.add_argument('--ml-endpoint', type=str, default='https://us-south.ml.cloud.ibm.com')
parser.add_argument('--bucket-endpoint', type=str, default='https://s3-api.us-geo.objectstorage.softlayer.net')
parser.add_argument('--private-bucket-endpoint', type=str, default='https://s3-api.us-geo.objectstorage.service.networklayer.com')
parser.add_argument('--result-bucket-name', type=str)
parser.add_argument('--result-bucket-endpoint', type=str)
parser.add_argument('--data-bucket-name', type=str)
parser.add_argument('--data-bucket-endpoint', type=str)
parser.add_argument('--gpu', type=str, default='k80')
parser.add_argument('--num-train-steps', type=int, default=300)
args = parser.parse_args()

MODEL_ZIP_PATH = 'tf-model.zip'


################################################################################
# Initialize Cloud Object Storage
################################################################################
cos = ibm_boto3.resource('s3',
  aws_access_key_id=os.getenv('ACCESS_KEY_ID'),
  aws_secret_access_key=os.getenv('SECRET_ACCESS_KEY'),
  endpoint_url=args.bucket_endpoint
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
    return bucket_id_name
  else:
    try:
      bucket_id_name = int(bucket_id_name)
      if bucket_id_name <= len(bucket_list) and bucket_id_name > 0:
        return bucket_list[bucket_id_name - 1]
      else:
        print('\nPlease choose a valid bucket:')
        return askForBucket()
    except ValueError:
      print('\nPlease choose a valid bucket:')
      return askForBucket()

if args.data_bucket_name == None:
  print('\nPlease choose a training \033[92mdata\033[0m bucket:')
  args.data_bucket_name = askForBucket()

if args.result_bucket_name == None:
  print('\nPlease choose a training \033[92mresults\033[0m bucket:')
  args.result_bucket_name = askForBucket()


################################################################################
# WML
################################################################################
wml_credentials = {
  'url': args.ml_endpoint,
  'username': os.getenv('ML_USERNAME'),
  'password': os.getenv('ML_PASSWORD'),
  'instance_id': os.getenv('ML_INSTANCE')
}

client = WatsonMachineLearningAPIClient(wml_credentials)

metadata = {
  client.repository.DefinitionMetaNames.NAME: 'tf-object-detection',
  client.repository.DefinitionMetaNames.FRAMEWORK_NAME: 'tensorflow',
  client.repository.DefinitionMetaNames.FRAMEWORK_VERSION: '1.12',
  client.repository.DefinitionMetaNames.RUNTIME_NAME: 'python',
  client.repository.DefinitionMetaNames.RUNTIME_VERSION: '3.5',
  client.repository.DefinitionMetaNames.EXECUTION_COMMAND: """
    pip install --user pycocotools;
    export PYTHONPATH=`pwd`/slim &&
    python3 -m bucket.prepare_data &&
    python3 -m object_detection.model_main
      --pipeline_config_path=${RESULT_DIR}/pipeline.config
      --model_dir=${RESULT_DIR}/checkpoint
      --num_train_steps=""" + args.num_train_steps + """
      --alsologtostderr &&
    python3 -m quick_export_graph
      --result_base=${RESULT_DIR}
      --output_label_path=${RESULT_DIR}/labels.json
      --model_dir=${RESULT_DIR}/model
  """
}
definition_details = client.repository.store_definition(MODEL_ZIP_PATH, meta_props=metadata)
definition_uid = client.repository.get_definition_uid(definition_details)
print('definition_uid: ', definition_uid)

metadata = {
  client.training.ConfigurationMetaNames.NAME: 'tf-object-detection_training-run',
  client.training.ConfigurationMetaNames.TRAINING_DATA_REFERENCE: {
    'connection': {
      'endpoint_url': args.data_bucket_endpoint or args.private_bucket_endpoint,
      'access_key_id': os.getenv('ACCESS_KEY_ID'),
      'secret_access_key': os.getenv('SECRET_ACCESS_KEY')
    },
    'source': {
      'bucket': args.data_bucket_name
    },
    'type': 's3'
  },
  client.training.ConfigurationMetaNames.TRAINING_RESULTS_REFERENCE: {
    'connection': {
      'endpoint_url': args.result_bucket_endpoint or args.private_bucket_endpoint,
      'access_key_id': os.getenv('ACCESS_KEY_ID'),
      'secret_access_key': os.getenv('SECRET_ACCESS_KEY')
    },
    'target': {
      'bucket': args.result_bucket_name
    },
    'type': 's3'
  },
  client.training.ConfigurationMetaNames.COMPUTE_CONFIGURATION: {'name': args.gpu}
}
run_details = client.training.run(definition_uid, meta_props=metadata)
run_uid = client.training.get_run_uid(run_details)
print('run_uid: ', run_uid)

client.training.monitor_logs(run_uid)

model_location = client.training.get_details(run_uid)['entity']['training_results_reference']['location']['model_location']

contents = cos.Bucket(args.result_bucket_name).objects.filter(
  Prefix=os.path.join(model_location, 'model')
)

if os.path.exists('exported_graph') and os.path.isdir('exported_graph'):
  shutil.rmtree('exported_graph')
os.makedirs('exported_graph')

for item in contents:
  local_path = '/'.join(item.key.split('/')[2:])
  local_path = os.path.join('exported_graph', local_path)
  print(local_path)
  if item.key.endswith('/'):
    if not os.path.exists(local_path):
      os.makedirs(local_path)
  else:
    cos.Object(args.result_bucket_name, item.key).download_file(local_path)

cos.Object(args.result_bucket_name, os.path.join(model_location, 'labels.json')).download_file('labels.json')
