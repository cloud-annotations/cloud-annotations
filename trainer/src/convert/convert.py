from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import os
import shutil
import argparse

from convert.types import ModelType

import tensorflow as tf

parser = argparse.ArgumentParser()
# export types
parser.add_argument('--coreml', action='store_true')
parser.add_argument('--tflite', action='store_true')
parser.add_argument('--tfjs', action='store_true')

# model params
parser.add_argument('--input-name', type=str)
parser.add_argument('--output-names', type=str, nargs='+')

# import paths
parser.add_argument('--exported-graph-path', type=str, default='exported_graph')

# export paths
parser.add_argument('--mlmodel-path', type=str, default='model_ios')
parser.add_argument('--tflite-path', type=str, default='model_android')
parser.add_argument('--tfjs-path', type=str, default='model_web')
args = parser.parse_args()

def infer_model_structure():
    if args.input_name and args.output_names:
        return {
            'input_name': args.input_name,
            'output_names': args.output_names,
            'type': ModelType.NONE
        }

    with tf.Session(graph=tf.Graph()) as sess:
        saved_model_path = os.path.join(args.exported_graph_path, 'saved_model')
        tf.saved_model.loader.load(sess, ['serve'], saved_model_path)
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

if args.coreml:
    from convert.convert_to_core_ml import convert_to_core_ml
    convert_to_core_ml(args.exported_graph_path, model_structure, args.mlmodel_path)

if args.tflite:
    from convert.convert_to_tflite import convert_to_tflite
    convert_to_tflite(args.exported_graph_path, model_structure, args.tflite_path)

if args.tfjs:
    from convert.convert_to_tfjs import convert_to_tfjs
    output_names = model_structure['output_names']
    convert_to_tfjs(args.exported_graph_path, output_names, args.tfjs_path)
