from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import os
import shutil
import argparse

from convert.types import ModelType

import tensorflow as tf
tf.enable_eager_execution()

parser = argparse.ArgumentParser()
# export types
parser.add_argument('--coreml', action='store_true')
parser.add_argument('--tflite', action='store_true')
parser.add_argument('--tfjs', action='store_true')

parser.add_argument('--model-type', type=str)

# import paths
parser.add_argument('--saved-model-path', type=str)

# export paths
parser.add_argument('--mlmodel-path', type=str, default='model_ios')
parser.add_argument('--tflite-path', type=str, default='model_android')
parser.add_argument('--tfjs-path', type=str, default='model_web')
args = parser.parse_args()

def infer_model_structure():
    with tf.Session(graph=tf.Graph()) as sess:
        tf.saved_model.loader.load(sess, ['serve'], args.saved_model_path)
        graph = tf.get_default_graph()
        ops = [op.name for op in graph.get_operations()]
        op1 = 'Postprocessor/ExpandDims_1'
        op2 = 'Postprocessor/Slice'
        op3 = 'final_result'
        input_op1 = 'image_tensor'
        input_op2 = 'Placeholder'

        if input_op1 in ops and op1 in ops and op2 in ops:
            return {
                'input_name': input_op1,
                'output_names': [op1, op2],
                'type': ModelType.LOCALIZATION
            }

        if input_op2 in ops and op3 in ops:
            return {
                'input_name': input_op2,
                'output_names': [op3],
                'type': ModelType.CLASSIFICATION
            }

model_structure = infer_model_structure()
print(args.model_type)

try:
    if args.coreml:
        print(' ' * 80)
        print('_' * 80)
        print('Converting to Core ML')
        from convert.convert_to_core_ml import convert_to_core_ml
        convert_to_core_ml(args.saved_model_path, model_structure, args.mlmodel_path)
        print('Successfully converted to Core ML')
        print('_' * 80)
        print(' ' * 80)
except Exception as e:
    print(e)
    print("Unable to convert to Core ML")
    print('_' * 80)
    print(' ' * 80)

try:
    if args.tflite:
        print(' ' * 80)
        print('_' * 80)
        print('Converting to TensorFlow Lite')
        from convert.convert_to_tflite import convert_to_tflite
        convert_to_tflite(args.saved_model_path, model_structure, args.tflite_path)
        print('Successfully converted to TensorFlow Lite')
        print('_' * 80)
        print(' ' * 80)
except Exception as e:
    print(e)
    print("Unable to convert to TensorFlow Lite")
    print('_' * 80)
    print(' ' * 80)

try:
    if args.tfjs:
        print(' ' * 80)
        print('_' * 80)
        print('Converting to TensorFlow.js')
        from convert.convert_to_tfjs import convert_to_tfjs
        output_names = model_structure['output_names']
        convert_to_tfjs(args.saved_model_path, output_names, args.tfjs_path)
        print('Successfully converted to TensorFlow.js')
        print('_' * 80)
        print(' ' * 80)
except Exception as e:
    print(e)
    print("Unable to convert to TensorFlow.js")
    print('_' * 80)
    print(' ' * 80)
