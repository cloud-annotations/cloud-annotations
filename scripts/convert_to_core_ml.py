import os
import json
import shutil

from scripts.types import ModelType

import tensorflow as tf
from tensorflow.python.platform import gfile

def convert_to_core_ml(exported_graph_path, model_structure, output_path):
    import tfcoreml
    
    if model_structure['type'] == ModelType.LOCALIZATION:
        print('TODO: This feature is not implemented yet.')
    else:
        if os.path.exists(output_path) and os.path.isdir(output_path):
            shutil.rmtree(output_path)
        os.makedirs(output_path)

        frozen_model_file = '.tmp/tmp_frozen_graph.pb'
        with tf.Session(graph=tf.Graph()) as sess:
            saved_model_path = os.path.join(exported_graph_path, 'saved_model/')
            tf.saved_model.loader.load(sess, [tf.saved_model.tag_constants.SERVING], saved_model_path)
            with gfile.GFile(frozen_model_file, 'wb') as f:
                output_graph_def = tf.graph_util.convert_variables_to_constants(
                    sess,
                    tf.get_default_graph().as_graph_def(),
                    model_structure['output_names']
                )
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

# from tensorflow.python.tools import strip_unused_lib
# from tensorflow.python.framework import dtypes
# from tensorflow.python.platform import gfile

# path = 'model_ios'
# if os.path.exists(path) and os.path.isdir(path):
#     shutil.rmtree(path)
# os.makedirs(path)

# image_input_names = '{}:0'.format(args.input_name)
# output_feature_names = ['{}:0'.format(name) for name in args.output_names]

# frozen_model_file = '.tmp/tmp_frozen_graph.pb'
# with tf.Session(graph=tf.Graph()) as sess:
#     tf.saved_model.loader.load(sess, [tf.saved_model.tag_constants.SERVING], args.tf_model_path) 
#     input_node_names = ['Preprocessor/sub']
#     output_node_names = ['concat', 'concat_1']
#     gdef = strip_unused_lib.strip_unused(
#             input_graph_def=sess.graph_def,
#             input_node_names=input_node_names,
#             output_node_names=output_node_names,
#             placeholder_type_enum=dtypes.float32.as_datatype_enum)
#     with gfile.GFile(frozen_model_file, "wb") as f:
#         f.write(gdef.SerializeToString())

# input_tensor_shapes = {'Preprocessor/sub:0':[1,300,300,3]} # batch size is 1
# output_tensor_names = ['concat:0', 'concat_1:0']

# tfcoreml.convert(tf_model_path=frozen_model_file,
#                 mlmodel_path=args.mlmodel_path,
#                 output_feature_names=output_tensor_names,
#                 # class_labels=args.class_labels,
#                 red_bias=-1,
#                 green_bias=-1,
#                 blue_bias=-1,
#                 image_scale=1.0/128.0,
#                 input_name_shape_dict=input_tensor_shapes)
#                 #  image_input_names=input_tensor_shapes)