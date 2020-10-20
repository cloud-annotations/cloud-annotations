import os
import json
import shutil

import numpy as np

from convert.TFLiteConverter import convert


def convert_localization(frozen_model, labels_path, output_path, anchors):
    os.makedirs(output_path, exist_ok=True)

    converter = convert.from_frozen_graph(
        frozen_model,
        input_arrays=["Preprocessor/sub"],
        output_arrays=["Squeeze", "Postprocessor/convert_scores"],
        input_shapes={"Preprocessor/sub": [1, 300, 300, 3]},
    )

    # Write tflite model
    tflite_model = converter.convert()
    with open(os.path.join(output_path, "model.tflite"), "wb") as f:
        f.write(tflite_model)

    # Write anchors
    anchors = np.swapaxes(anchors, 0, 1)
    with open(os.path.join(output_path, "anchors.json"), "w") as f:
        json.dump(anchors.tolist(), f)

    # Move the labels to the model directory.
    shutil.copy2(labels_path, output_path)


def convert_classification(frozen_model, labels_path, output_path):
    os.makedirs(output_path, exist_ok=True)

    converter = convert.from_frozen_graph(
        frozen_model,
        input_arrays=["Placeholder"],
        output_arrays=["final_result"],
        input_shapes={"Placeholder": [1, 224, 224, 3]},
    )

    tflite_model = converter.convert()
    with open(os.path.join(output_path, "model.tflite"), "wb") as f:
        f.write(tflite_model)

    # Move the labels to the model directory.
    with open(labels_path, "r") as f:
        labels = f.read()
        labels = list(filter(bool, [s.strip() for s in labels.splitlines()]))
    with open(os.path.join(output_path, "labels.json"), "w") as f:
        json.dump(labels, f)
