import tensorflow as tf
from pkg_resources import parse_version


print("Using TensorFlow version: {}".format(parse_version(tf.__version__)))

# TensorFlow 1.12
if parse_version(tf.__version__) < parse_version("1.13"):
    print("Using contrib TFLiteConverter")
    convert = tf.contrib.lite.TFLiteConverter

# Current
else:
    print("Using current TFLiteConverter")
    convert = tf.lite.TFLiteConverter
