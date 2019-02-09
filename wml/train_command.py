import os
import json
import argparse
from subprocess import call

parser = argparse.ArgumentParser()
parser.add_argument('--num-train-steps', type=int, default=300)
args = parser.parse_args()

annotations_file = os.path.join(os.environ['DATA_DIR'], '_annotations.json')

with open(annotations_file) as f:
  annotations_type = json.load(f)['type']

if annotations_type == 'localization':
  execution_command = """
    pip install --user pycocotools;
    export PYTHONPATH=`pwd`/slim &&
    python3 -m bucket.prepare_data_object_detection &&
    python3 -m object_detection.model_main
      --pipeline_config_path=${RESULT_DIR}/pipeline.config
      --model_dir=${RESULT_DIR}/checkpoint
      --num_train_steps=""" + str(args.num_train_steps) + """
      --alsologtostderr &&
    python3 -m quick_export_graph
      --result_base=${RESULT_DIR}
      --output_label_path=${RESULT_DIR}/labels.json
      --model_dir=${RESULT_DIR}/model
  """
else:
  execution_command = """
    pip install --user tensorflow_hub;
    python3 -m bucket.prepare_data_classification &&
    python -m classification.retrain \
      --image_dir=${RESULT_DIR}/data \
      --saved_model_dir=${RESULT_DIR}/model/saved_model \
      --tfhub_module=https://tfhub.dev/google/imagenet/mobilenet_v1_100_224/feature_vector/1 \
      --how_many_training_steps=""" + str(args.num_train_steps) + """ \
      --output_labels=${RESULT_DIR}/output_labels.txt
  """

  call(execution_command, shell=True)