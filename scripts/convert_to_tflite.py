import tensorflow as tf

from tensorflow.python.tools import strip_unused_lib
from tensorflow.python.framework import dtypes
from tensorflow.python.platform import gfile

# TensorFlow 1.9 to TensorFlow 1.11
if tf.__version__ <= '1.11.0':
    from tensorflow.contrib.lite.python.lite import TocoConverter as convert
elif tf.__version__ <= '1.12.0':
    convert = tf.contrib.lite.TFLiteConverter
else:
    convert = tf.lite.TFLiteConverter

def convert_to_tflite():
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