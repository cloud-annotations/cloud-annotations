import tensorflow as tf
from pkg_resources import parse_version

import os
import json
import shutil

from convert.types import ModelType
from convert.convert_ssd_helper import convert_ssd_tflite

# TensorFlow 1.12
if parse_version(tf.__version__) < parse_version('1.13'):
    convert = tf.contrib.lite.TFLiteConverter

# Current
else:
    convert = tf.lite.TFLiteConverter

def convert_to_tflite(exported_graph_path, model_structure, output_path):
    if model_structure['type'] == ModelType.LOCALIZATION:
        if os.path.exists(output_path) and os.path.isdir(output_path):
            shutil.rmtree(output_path)
        os.makedirs(output_path)

        convert_ssd_tflite(exported_graph_path, model_structure, output_path)

        # Move the labels to the model directory.
        json_labels = os.path.join(exported_graph_path, 'labels.json')
        shutil.copy2(json_labels, output_path)
    else:
        if os.path.exists(output_path) and os.path.isdir(output_path):
            shutil.rmtree(output_path)
        os.makedirs(output_path)

        input_arrays = [model_structure['input_name']]
        output_arrays = model_structure['output_names']

        saved_model_path = os.path.join(exported_graph_path, 'saved_model')
        converter = convert.from_saved_model(
            saved_model_path,
            input_arrays=input_arrays,
            output_arrays=output_arrays)
        tflite_model = converter.convert()
        with open(os.path.join(output_path, 'model.tflite'), 'wb') as f:
            f.write(tflite_model)

        # Move the labels to the model directory.
        json_labels = os.path.join(exported_graph_path, 'labels.json')
        text_labels = os.path.join(exported_graph_path, 'labels.txt')
        if not os.path.isfile(json_labels):
            with open(text_labels, 'r') as f:
                labels = f.read()
                labels = list(filter(bool, [s.strip() for s in labels.splitlines()]))
            with open(os.path.join(output_path, 'labels.json'), 'w') as f:
                json.dump(labels, f)
        else:
            shutil.copy2(json_labels, output_path)