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
    pip install --user --no-deps pycocotools==2.0.0 coremltools==2.0 tfcoreml==0.3.0 tensorflowjs==0.8.0 tensorflow-hub==0.3.0 h5py==2.8.0;
    export PYTHONPATH=`pwd`/slim &&
    python3 -m bucket.prepare_data_object_detection &&
    python3 -m object_detection.model_main \
      --pipeline_config_path=${RESULT_DIR}/pipeline.config \
      --model_dir=${RESULT_DIR}/checkpoint \
      --num_train_steps=""" + str(args.num_train_steps) + """ \
      --log_step_count_steps=1 \
      --alsologtostderr &&
    echo training success &&
    python3 -m scripts.quick_export_graph \
      --result_base=${RESULT_DIR} \
      --model_dir=${RESULT_DIR}/model &&
    python3 -m scripts.convert --tfjs --coreml \
      --tfjs-path=${RESULT_DIR}/model_web \
      --mlmodel-path=${RESULT_DIR}/model_ios \
      --exported-graph-path=${RESULT_DIR}/model
  """
else:
  execution_command = """
    pip install --user --no-deps tensorflow-hub==0.1.1 coremltools==2.0 tfcoreml==0.3.0;
    python3 -m bucket.prepare_data_classification &&
    python3 -m classification.retrain \
      --image_dir=${RESULT_DIR}/data \
      --saved_model_dir=${RESULT_DIR}/model/saved_model \
      --tfhub_module=https://tfhub.dev/google/imagenet/mobilenet_v1_100_224/feature_vector/1 \
      --how_many_training_steps=""" + str(args.num_train_steps) + """ \
      --output_labels=${RESULT_DIR}/model/labels.txt &&
    echo training success &&
    python3 -m scripts.convert --coreml --tflite \
      --mlmodel-path=${RESULT_DIR}/model_ios \
      --tflite-path=${RESULT_DIR}/model_android \
      --exported-graph-path=${RESULT_DIR}/model
  """

call(execution_command, shell=True)