from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--type', type=str, default='classification')
parser.add_argument('--coreml', action='store_true')
parser.add_argument('--tflite', action='store_true')
parser.add_argument('--tfjs', action='store_true')
parser.add_argument('--input-name', type=str, default='input')
parser.add_argument('--output-name', type=str, default='final_result')
parser.add_argument('--tf_model-path', type=str, default='exported_graph/saved_model/saved_model.pb')
parser.add_argument('--mlmodel-path', type=str, default='model.mlmodel')
parser.add_argument('--tflite-path', type=str, default='model.tflite')
parser.add_argument('--class-labels', type=str, default='labels.json')
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

if args.tfjs:
    from tensorflowjs.converters import tf_saved_model_conversion_pb

    tf_saved_model_conversion_pb.convert_tf_saved_model(
            'exported_graph/saved_model',
            'Postprocessor/ExpandDims_1,Postprocessor/Slice',
            'web_model',
            saved_model_tags='serve',
            quantization_dtype=None,
            skip_op_check=False,
            strip_debug_ops=True)



    # tensorflowjs_converter \
    # --input_format=tf_saved_model \
    # --output_node_names='Postprocessor/ExpandDims_1,Postprocessor/Slice' \
    # exported_graph/saved_model \
    # web_model