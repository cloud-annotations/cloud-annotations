import os
import json
import argparse
from subprocess import call

parser = argparse.ArgumentParser()
parser.add_argument('--steps', type=int, default=300)
args = parser.parse_args()

call('python3 -m bucket.download', shell=True)

annotations_file = os.path.join('.tmp', '_annotations.json')

with open(annotations_file) as f:
  annotations_type = json.load(f)['type']

if annotations_type == 'localization':
  execution_command = """
    export PYTHONPATH=`pwd`/slim &&
    python3 -m object_detection.model_main \
      --pipeline_config_path=.tmp/pipeline.config \
      --model_dir=.tmp/checkpoint \
      --log_step_count_steps=10 \
      --num_train_steps=""" + str(args.steps) + """ \
      --alsologtostderr &&
    python3 -m scripts.quick_export_graph \
      --result_base=.tmp \
      --model_dir=.tmp/model &&
    python3 -m scripts.convert --tfjs --coreml \
      --tfjs-path=.tmp/model_web \
      --mlmodel-path=.tmp/model_ios \
      --exported-graph-path=.tmp/model
  """
else:
  execution_command = """
    python3 -m classification.retrain \
      --image_dir=.tmp/data \
      --saved_model_dir=.tmp/model/saved_model \
      --tfhub_module=https://tfhub.dev/google/imagenet/mobilenet_v1_100_224/feature_vector/1 \
      --how_many_training_steps=""" + str(args.steps) + """ \
      --output_labels=.tmp/model/labels.txt &&
    python3 -m scripts.convert --coreml --tflite \
      --mlmodel-path=.tmp/model_ios \
      --tflite-path=.tmp/model_android \
      --exported-graph-path=.tmp/model
  """

call(execution_command, shell=True)