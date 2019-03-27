import os
import json
import shutil
from datetime import datetime

from convert.types import ModelType
from convert.convert_ssd_helper import convert_ssd

import tensorflow as tf
from tensorflow.python.tools import strip_unused_lib
from tensorflow.python.framework import dtypes
from tensorflow.python.platform import gfile

def convert_to_core_ml(exported_graph_path, model_structure, output_path):
    import tfcoreml

    if not os.path.exists('.tmp'):
        os.makedirs('.tmp')

    if os.path.exists(output_path) and os.path.isdir(output_path):
        shutil.rmtree(output_path)
    os.makedirs(output_path)
    
    if model_structure['type'] == ModelType.LOCALIZATION:
        convert_ssd(exported_graph_path, model_structure, output_path)
    else:
        frozen_model_file = '.tmp/tmp_frozen_graph.pb'
        with tf.Session(graph=tf.Graph()) as sess:
            saved_model_path = os.path.join(exported_graph_path, 'saved_model/')
            tf.saved_model.loader.load(sess, [tf.saved_model.tag_constants.SERVING], saved_model_path)
            with gfile.GFile(frozen_model_file, 'wb') as f:
                output_graph_def = tf.graph_util.convert_variables_to_constants(
                        sess,
                        tf.get_default_graph().as_graph_def(),
                        model_structure['output_names'])
                f.write(output_graph_def.SerializeToString())
        
        output_feature_names = ['{}:0'.format(name) for name in model_structure['output_names']]

        class_labels = None
        json_labels = os.path.join(exported_graph_path, 'labels.json')
        text_labels = os.path.join(exported_graph_path, 'labels.txt')
        if os.path.isfile(text_labels):
            with open(text_labels, 'r') as f:
                class_labels = f.read()
                class_labels = list(filter(bool, [s.strip() for s in class_labels.splitlines()]))
        elif os.path.isfile(json_labels):
            with open(json_labels) as f:
                class_labels = json.load(f)

        tfcoreml.convert(tf_model_path=frozen_model_file,
                mlmodel_path=os.path.join(output_path, 'Model.mlmodel'),
                output_feature_names=output_feature_names,
                class_labels=class_labels,
                red_bias=-1,
                green_bias=-1,
                blue_bias=-1,
                image_scale=1.0/128.0,
                image_input_names='{}:0'.format(model_structure['input_name']))