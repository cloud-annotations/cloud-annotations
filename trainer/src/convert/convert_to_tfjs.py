import os
import json
import shutil

import tensorflow as tf
from tensorflow.python.tools import strip_unused_lib
from tensorflow.python.framework import dtypes
from tensorflow.python.platform import gfile

def convert_to_tfjs(saved_model_path, output_names, output_path):
    from tensorflowjs.converters import tf_saved_model_conversion_v2
    from convert.convert_ssd_helper import optimize_graph

    output_names_str = ','.join(output_names)


    frozen_model_file = '.tmp/tfjs_tmp_frozen_graph.pb'

    with tf.Session(graph=tf.Graph()) as sess:
        print('loading model...')
        tf.saved_model.loader.load(sess, [tf.saved_model.SERVING], saved_model_path)

        print('stripping unused ops...')
        gdef = strip_unused_lib.strip_unused(
            input_graph_def=tf.get_default_graph().as_graph_def(),
            input_node_names=[],
            output_node_names=output_names,
            placeholder_type_enum=dtypes.float32.as_datatype_enum)

        gdef = tf.graph_util.convert_variables_to_constants(sess, gdef, output_names)

        with gfile.GFile(frozen_model_file, 'wb') as f:
            print('writing frozen model...')
            f.write(gdef.SerializeToString())
    # optimize_graph(saved_model_path, frozen_model_path, [], output_names)

    tf_saved_model_conversion_v2.convert_tf_frozen_model(
        frozen_model_file,
        output_names_str,
        output_path,
        quantization_dtype=None,
        skip_op_check=False,
        strip_debug_ops=True)


    # Move the labels to the model directory.
    json_labels = os.path.join(saved_model_path, 'labels.json')
    text_labels = os.path.join(saved_model_path, 'labels.txt')
    if not os.path.isfile(json_labels):
        with open(text_labels, 'r') as f:
            labels = f.read()
        labels = list(filter(bool, [s.strip() for s in labels.splitlines()]))
        with open(os.path.join(output_path, 'labels.json'), 'w') as f:
            json.dump(labels, f)
    else:
        shutil.copy2(json_labels, output_path)
