# Copyright 2017 The TensorFlow Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ==============================================================================
"""Binary to run train and evaluation on object detection model."""
import logging

from absl import flags
import tensorflow.compat.v2 as tf
from object_detection import model_lib_v2

tf.get_logger().setLevel(logging.ERROR)

flags.DEFINE_string("pipeline_config_path", None, "Path to pipeline config " "file.")
flags.DEFINE_integer("num_train_steps", None, "Number of train steps.")
flags.DEFINE_string(
    "model_dir",
    None,
    "Path to output model directory "
    "where event and checkpoint files will be written.",
)
flags.DEFINE_integer(
    "checkpoint_every_n", 1000, "Integer defining how often we checkpoint."
)
flags.DEFINE_boolean(
    "record_summaries", True, ("Whether or not to record summaries during" " training.")
)

FLAGS = flags.FLAGS


def main(unused_argv):
    tf.config.set_soft_device_placement(True)

    strategy = tf.compat.v2.distribute.MirroredStrategy()

    with strategy.scope():
        model_lib_v2.train_loop(
            pipeline_config_path=FLAGS.pipeline_config_path,
            model_dir=FLAGS.model_dir,
            train_steps=FLAGS.num_train_steps,
            checkpoint_every_n=FLAGS.checkpoint_every_n,
            record_summaries=FLAGS.record_summaries,
        )


if __name__ == "__main__":
    tf.compat.v1.app.run()
