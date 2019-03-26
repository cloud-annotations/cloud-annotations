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


pre = [
    'pip install --user --no-deps -r requirements.txt'
]

object_detection = [
    'export PYTHONPATH=`pwd`/slim',
    'python -m bucket.prepare_data_object_detection',
    'python -m object_detection.model_main \
        --pipeline_config_path=${RESULT_DIR}/pipeline.config \
        --model_dir=${RESULT_DIR}/checkpoint \
        --num_train_steps=' + str(args.num_train_steps) + ' \
        --log_step_count_steps=1 \
        --alsologtostderr',
    'python -m scripts.quick_export_graph --result_base=${RESULT_DIR} --model_dir=${RESULT_DIR}/model'
]

classification = [
    'python -m bucket.prepare_data_classification',
    'python -m classification.retrain \
        --image_dir=${RESULT_DIR}/data \
        --saved_model_dir=${RESULT_DIR}/model/saved_model \
        --tfhub_module=https://tfhub.dev/google/imagenet/mobilenet_v1_100_224/feature_vector/1 \
        --how_many_training_steps=' + str(args.num_train_steps) + ' \
        --output_labels=${RESULT_DIR}/model/labels.txt'
]

post = [
    'echo training success',
    'python -m scripts.convert --tfjs --coreml --tflite \
        --tfjs-path=${RESULT_DIR}/model_web \
        --mlmodel-path=${RESULT_DIR}/model_ios \
        --tflite-path=${RESULT_DIR}/model_android \
        --exported-graph-path=${RESULT_DIR}/model'
]


def run_commands(commands):
    for command in commands:
        call(command, shell=True)


run_commands(pre)

if annotations_type == 'localization':
    run_commands(object_detection)
else:
    run_commands(classification)

run_commands(post)