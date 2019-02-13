import os
import json
import shutil
from datetime import datetime

from scripts.types import ModelType

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
        frozen_model_file = '.tmp/tmp_frozen_graph.pb'
        with tf.Session(graph=tf.Graph()) as sess:
            saved_model_path = os.path.join(exported_graph_path, 'saved_model/')
            tf.saved_model.loader.load(sess, [tf.saved_model.tag_constants.SERVING], saved_model_path)
            with gfile.GFile(frozen_model_file, 'wb') as f:
                output_graph_def = tf.graph_util.convert_variables_to_constants(
                        sess,
                        tf.get_default_graph().as_graph_def(),
                        model_structure['output_names'])

                input_node_names = ['Preprocessor/sub']
                output_node_names = ['concat', 'concat_1']
                stripped_graph_def = strip_unused_lib.strip_unused(
                        input_graph_def=output_graph_def,
                        input_node_names=input_node_names,
                        output_node_names=output_node_names,
                        placeholder_type_enum=dtypes.float32.as_datatype_enum)

                f.write(stripped_graph_def.SerializeToString())

        input_tensor_shapes = {'Preprocessor/sub:0': [1, 300, 300, 3]}

        input_tensor_names = ['Preprocessor/sub:0']
        output_tensor_names = ['concat:0', 'concat_1:0']
        
        tfcoreml.convert(tf_model_path=frozen_model_file,
                mlmodel_path=os.path.join(output_path, 'Model.mlmodel'),
                output_feature_names=output_tensor_names,
                red_bias=-1,
                green_bias=-1,
                blue_bias=-1,
                image_scale=1.0/128.0,
                input_name_shape_dict=input_tensor_shapes,
                image_input_names=input_tensor_names)

        json_labels = os.path.join(exported_graph_path, 'labels.json')
        with open(json_labels) as f:
            labels = json.load(f)
            with open(os.path.join(output_path, 'Labels.swift'), 'w') as swift_labels:
                swift_labels.write('//\n')
                swift_labels.write('//\tLabels.swift\n')
                swift_labels.write('//\tCloud Annotations\n')
                swift_labels.write('//\n')
                swift_labels.write('//\tGenerated on {}.\n'.format(datetime.now().strftime("%m/%d/%y")))
                swift_labels.write('//\n\n')

                swift_labels.write('struct Labels {\n')
                swift_labels.write('\tstatic let names = [\n')

                for i, label in enumerate(labels):
                    if i < len(labels) - 1:
                        swift_labels.write('\t\t"{}",\n'.format(label))
                    else:
                        swift_labels.write('\t\t"{}"\n'.format(label))

                swift_labels.write('\t]\n')
                swift_labels.write('}\n')

        anchors = os.path.join(exported_graph_path, 'Anchors.swift')
        shutil.copy2(anchors, output_path)
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