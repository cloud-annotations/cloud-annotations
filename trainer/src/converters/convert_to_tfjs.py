import shutil

from tensorflowjs.converters.tf_saved_model_conversion_v2 import convert_tf_saved_model


def convert_localization(frozen_model, labels_path, output_path):
    convert_tf_saved_model(frozen_model, output_path, skip_op_check=True)

    # Move the labels to the model directory.
    shutil.copy2(labels_path, output_path)
