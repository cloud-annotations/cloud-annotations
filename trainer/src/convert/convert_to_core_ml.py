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

def convert_to_core_ml(saved_model_path, model_structure, output_path):
    import tfcoreml
    
    if not os.path.exists('.tmp'):
        os.makedirs('.tmp')

    if os.path.exists(output_path) and os.path.isdir(output_path):
        shutil.rmtree(output_path)
    os.makedirs(output_path)
    
    if model_structure['type'] == ModelType.LOCALIZATION:
        convert_ssd(saved_model_path, model_structure, output_path)
    else:
        frozen_model_file = '.tmp/tmp_frozen_graph.pb'

        with tf.Session(graph=tf.Graph()) as sess:
            print('loading model...')
            tf.saved_model.loader.load(sess, [tf.saved_model.SERVING], saved_model_path)

            print('stripping unused ops...')
            gdef = strip_unused_lib.strip_unused(
                input_graph_def=tf.get_default_graph().as_graph_def(),
                input_node_names=[model_structure['input_name']],
                output_node_names=model_structure['output_names'],
                placeholder_type_enum=dtypes.float32.as_datatype_enum)

            gdef = tf.graph_util.convert_variables_to_constants(sess, gdef, model_structure['output_names'])

            with gfile.GFile(frozen_model_file, 'wb') as f:
                print('writing frozen model...')
                f.write(gdef.SerializeToString())


        # with tf.Session(graph=tf.Graph()) as sess:
        #     tf.saved_model.loader.load(sess, [tf.saved_model.SERVING], saved_model_path)
        #     with gfile.GFile(frozen_model_file, 'wb') as f:
        #         output_graph_def = tf.graph_util.convert_variables_to_constants(
        #                 sess,
        #                 tf.get_default_graph().as_graph_def(),
        #                 model_structure['output_names'])
        #         f.write(output_graph_def.SerializeToString())
        
        # output_feature_names = ['{}:0'.format(name) for name in model_structure['output_names']]

        print('loading labels...')
        class_labels = None
        text_labels = os.path.join(saved_model_path, 'labels.txt')
        if os.path.isfile(text_labels):
            with open(text_labels, 'r') as f:
                class_labels = f.read()
                class_labels = list(filter(bool, [s.strip() for s in class_labels.splitlines()]))

        
        print(model_structure['input_name'])
        print(model_structure['output_names'])
        print(class_labels)

        print('converting...')
        # , "input/BottleneckInputPlaceholder": [-1, 1024]
        tfcoreml.convert(
            tf_model_path=frozen_model_file,
            mlmodel_path=os.path.join(output_path, 'Model.mlmodel'),
            input_name_shape_dict={model_structure['input_name']: [1, 224, 224, 3] , "input/BottleneckInputPlaceholder": [-1, 1024]},
            image_input_names=[model_structure['input_name']],
            output_feature_names=model_structure['output_names'],
            # predicted_probabilities_output='final_result',
            # predicted_feature_name='classLabel',
            class_labels=os.path.join(saved_model_path, 'labels.txt'),
            is_bgr=False,
            red_bias=-1.0,
            green_bias=-1.0,
            blue_bias=-1.0,
            image_scale=2./255,
            minimum_ios_deployment_target='13')

        # tfcoreml.convert(
        #     tf_model_path=frozen_model_file,
        #     mlmodel_path=os.path.join(output_path, 'Model.mlmodel'),
        #     image_input_names=[model_structure['input_name']],
        #     output_feature_names=model_structure['output_names'],
        #     class_labels=class_labels,
        #     red_bias=-1,
        #     green_bias=-1,
        #     blue_bias=-1,
        #     image_scale=1.0/128.0,
        #     minimum_ios_deployment_target='13')