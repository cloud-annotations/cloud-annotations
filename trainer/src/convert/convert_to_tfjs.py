import os
import json
import shutil

from tensorflowjs.converters import tf_saved_model_conversion_v2


def convert_localization(frozen_model, labels_path, output_path):
    tf_saved_model_conversion_v2.convert_tf_frozen_model(
        frozen_model,
        "Postprocessor/ExpandDims_1,Postprocessor/Slice",
        output_path,
        quantization_dtype=None,
        skip_op_check=False,
        strip_debug_ops=True,
    )

    # Move the labels to the model directory.
    shutil.copy2(labels_path, output_path)


def convert_classification(frozen_model, labels_path, output_path):
    tf_saved_model_conversion_v2.convert_tf_frozen_model(
        frozen_model,
        "final_result",
        output_path,
        quantization_dtype=None,
        skip_op_check=False,
        strip_debug_ops=True,
    )

    # Move the labels to the model directory.
    with open(labels_path, "r") as f:
        labels = f.read()
        labels = list(filter(bool, [s.strip() for s in labels.splitlines()]))
    with open(os.path.join(output_path, "labels.json"), "w") as f:
        json.dump(labels, f)
