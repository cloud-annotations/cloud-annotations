from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--coreml', action='store_true')
parser.add_argument('--tflite', action='store_true')
parser.add_argument('--tfjs', action='store_true')
parser.add_argument('--input_name', type=str, default='input')
parser.add_argument('--output_name', type=str, default='final_result')
parser.add_argument('--tf_model_path', type=str, default='.tmp/model.pb')
parser.add_argument('--mlmodel_path', type=str, default='.tmp/model.mlmodel')
parser.add_argument('--tflite_path', type=str, default='.tmp/model.tflite')
parser.add_argument('--class_labels', type=str, default='.tmp/model.labels')
args = parser.parse_args()

if args.coreml:
    import tfcoreml

    tfcoreml.convert(tf_model_path=args.tf_model_path,
                     mlmodel_path=args.mlmodel_path,
                     output_feature_names=['{}:0'.format(args.output_name)],
                     class_labels=args.class_labels,
                     red_bias=-1,
                     green_bias=-1,
                     blue_bias=-1,
                     image_scale=1.0/128.0,
                     image_input_names='{}:0'.format(args.input_name))

if args.tflite:
    import tensorflow as ts
    # TensorFlow 1.9 to TensorFlow 1.11
    if ts.__version__ <= '1.11.0':
        from tensorflow.contrib.lite.python.lite import TocoConverter as convert
    else:
        from tensorflow.contrib.lite import TFLiteConverter as convert

    input_arrays = [args.input_name]
    output_arrays = [args.output_name]

    converter = convert.from_frozen_graph(args.tf_model_path, input_arrays, output_arrays)
    tflite_model = converter.convert()
    open(args.tflite_path, 'wb').write(tflite_model)