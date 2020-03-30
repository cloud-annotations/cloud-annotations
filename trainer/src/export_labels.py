import json

import tensorflow as tf
from object_detection.utils.label_map_util import get_label_map_dict


flags = tf.app.flags
flags.DEFINE_string("label_map_path", None, "Path to label map.")
flags.DEFINE_string("output_label_path", None, "Path to write labels.")
tf.app.flags.mark_flag_as_required("label_map_path")
tf.app.flags.mark_flag_as_required("output_label_path")
FLAGS = flags.FLAGS


def main(_):
    label_map = get_label_map_dict(FLAGS.label_map_path)
    label_array = [k for k in sorted(label_map, key=label_map.get)]
    with open(FLAGS.output_label_path, "w") as f:
        json.dump(label_array, f)


if __name__ == "__main__":
    tf.app.run(main)
