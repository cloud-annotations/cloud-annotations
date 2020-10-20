import os
import re

import tensorflow as tf


flags = tf.app.flags
flags.DEFINE_string("checkpoint_path", None, "Path to checkpoints.")
tf.app.flags.mark_flag_as_required("checkpoint_path")
FLAGS = flags.FLAGS


def main(_):
    regex = re.compile(r"model\.ckpt-([0-9]+)\.index")
    numbers = [
        int(regex.search(f).group(1))
        for f in os.listdir(FLAGS.checkpoint_path)
        if regex.search(f)
    ]
    if not numbers:
        print("No checkpoint found!")
        exit(1)
    trained_checkpoint_prefix = os.path.join(
        FLAGS.checkpoint_path, "model.ckpt-{}".format(max(numbers))
    )
    print(trained_checkpoint_prefix)


if __name__ == "__main__":
    tf.app.run(main)
