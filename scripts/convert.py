from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import os
import shutil
import argparse
import tensorflow as tf

from tensorflow.python.tools import strip_unused_lib
from tensorflow.python.framework import dtypes
from tensorflow.python.platform import gfile

parser = argparse.ArgumentParser()
parser.add_argument('--type', type=str, default='classification')
parser.add_argument('--coreml', action='store_true')
parser.add_argument('--tflite', action='store_true')
parser.add_argument('--tfjs', action='store_true')
parser.add_argument('--input-name', type=str)
parser.add_argument('--output-names', type=str, nargs='+')
parser.add_argument('--tf-model-path', type=str, default='exported_graph/saved_model')
parser.add_argument('--tf-model-name', type=str, default='saved_model.pb')
parser.add_argument('--mlmodel-path', type=str, default='model_ios/model.mlmodel')
parser.add_argument('--tflite-path', type=str, default='model_android/model.tflite')
parser.add_argument('--tfjs-path', type=str, default='model_web')
parser.add_argument('--class-labels', type=str, default='labels.json')
args = parser.parse_args()

LOCALIZATION = 'localization'
CLASSIFICATION = 'classification'
guessed_type = ''

if not args.input_name or not args.output_names:
    with tf.Session(graph=tf.Graph()) as sess:
        tf.saved_model.loader.load(sess, ["serve"], args.tf_model_path)
        graph = tf.get_default_graph()
        ops = [op.name for op in graph.get_operations()]
        op1 = 'Postprocessor/ExpandDims_1'
        op2 = 'Postprocessor/Slice'
        op3 = 'final_result'
        input_op1 = 'image_tensor'
        input_op2 = 'Placeholder'

        if not args.input_name and input_op1 in ops:
            guessed_type = LOCALIZATION
            args.input_name = input_op1
        elif not args.input_name and input_op2 in ops:
            guessed_type = CLASSIFICATION
            args.input_name = input_op2
        if not args.output_names and op1 in ops and op2 in ops:
            guessed_type = LOCALIZATION
            args.output_names = [op1, op2]
        elif not args.output_names and op3 in ops:
            guessed_type = CLASSIFICATION
            args.output_names = [op3]


def convert_to_core_ml():
    import tfcoreml

    path = 'model_ios'
    if os.path.exists(path) and os.path.isdir(path):
        shutil.rmtree(path)
    os.makedirs(path)

    # image_input_names = '{}:0'.format(args.input_name)
    # output_feature_names = ['{}:0'.format(name) for name in args.output_names]
    if LOCALIZATION:
        print('core ml coming soon for object detection')
        return

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


def convert_to_tflite():
    if LOCALIZATION:
        print('tflite coming soon for object detection')
        return
    # TensorFlow 1.9 to TensorFlow 1.11
    if tf.__version__ <= '1.11.0':
        from tensorflow.contrib.lite.python.lite import TocoConverter as convert
    elif tf.__version__ <= '1.12.0':
        convert = tf.contrib.lite.TFLiteConverter
    else:
        convert = tf.lite.TFLiteConverter

    path = 'model_android'
    if os.path.exists(path) and os.path.isdir(path):
        shutil.rmtree(path)
    os.makedirs(path)

    input_arrays = [args.input_name]
    output_arrays = args.output_names

    converter = convert.from_saved_model(
            args.tf_model_path,
            input_arrays=input_arrays,
            # input_shapes={args.input_name : [1, 300, 300, 3]},
            output_arrays=output_arrays)
    tflite_model = converter.convert()
    open(args.tflite_path, 'wb').write(tflite_model)


def convert_to_tfjs():
    from tensorflowjs.converters import convert_tf_saved_model

    output_node_names = ','.join(args.output_names)

    convert_tf_saved_model(
            args.tf_model_path,
            output_node_names,
            args.tfjs_path,
            saved_model_tags='serve',
            quantization_dtype=None,
            skip_op_check=False,
            strip_debug_ops=True)


if args.coreml:
    convert_to_core_ml()

if args.tflite:
    convert_to_tflite()

if args.tfjs:
    convert_to_tfjs()