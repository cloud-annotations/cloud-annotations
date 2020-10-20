import os
import argparse

import numpy as np
import tensorflow as tf

from tensorflow.python.platform import gfile
from tensorflow.python.framework import dtypes
from tensorflow.python.tools import strip_unused_lib


tf.enable_eager_execution()


parser = argparse.ArgumentParser()
# export types
parser.add_argument("--coreml", action="store_true")
parser.add_argument("--tflite", action="store_true")
parser.add_argument("--tfjs", action="store_true")

parser.add_argument("--model-type", type=str)

# import paths
parser.add_argument("--saved-model", type=str)

# export paths
parser.add_argument("--mlmodel-path", type=str)
parser.add_argument("--tflite-path", type=str)
parser.add_argument("--tfjs-path", type=str)
args = parser.parse_args()


def print_header(msg):
    print(" " * 80)
    print("_" * 80)
    print(msg)


def print_footer(msg):
    print(msg)
    print("_" * 80)
    print(" " * 80)


def attempt_conversion(model_type, model_format):
    def attempt_conversion(convert):
        try:
            print_header(f"Converting {model_type} model to {model_format}")
            convert()
            print_footer(f"Successfully converted to {model_format}")
        except Exception as e:
            print(e)
            print_footer(f"Unable to convert to {model_format}")

    return attempt_conversion


def get_anchors(graph):
    """
    Computes the list of anchor boxes by sending a fake image through the graph.
    Outputs an array of size (4, num_anchors) where each element is an anchor box
    given as [ycenter, xcenter, height, width] in normalized coordinates.
    """
    with tf.Session(graph=graph) as sess:
        anchors_tensor = "Concatenate/concat:0"
        image_tensor = graph.get_tensor_by_name("image_tensor:0")
        box_corners_tensor = graph.get_tensor_by_name(anchors_tensor)
        box_corners = sess.run(
            box_corners_tensor, feed_dict={image_tensor: np.zeros((1, 300, 300, 3))}
        )

        # The TensorFlow graph gives each anchor box as [ymin, xmin, ymax, xmax].
        # Convert these min/max values to a center coordinate, width and height.
        ymin, xmin, ymax, xmax = np.transpose(box_corners)
        width = xmax - xmin
        height = ymax - ymin
        ycenter = ymin + height / 2.0
        xcenter = xmin + width / 2.0
        return np.stack([ycenter, xcenter, height, width])


def strip_and_freeze_model(
    saved_model, output_path, input_node_names=[], output_node_names=[]
):
    graph = tf.Graph()
    with tf.Session(graph=graph) as sess:
        print("loading model...")
        tf.saved_model.loader.load(sess, [tf.saved_model.SERVING], saved_model)

        print("stripping unused ops...")
        gdef = strip_unused_lib.strip_unused(
            input_graph_def=tf.get_default_graph().as_graph_def(),
            input_node_names=input_node_names,
            output_node_names=output_node_names,
            placeholder_type_enum=dtypes.float32.as_datatype_enum,
        )

        gdef = tf.graph_util.convert_variables_to_constants(
            sess, gdef, output_node_names
        )

        with gfile.GFile(output_path, "wb") as f:
            print("writing frozen model...")
            f.write(gdef.SerializeToString())
    return graph


os.makedirs(".tmp", exist_ok=True)


################################################################################
# Object Detection
################################################################################
if args.model_type == "localization":
    labels_path = os.path.join(args.saved_model, "labels.json")

    @attempt_conversion("object detection", "Core ML")
    def convert_object_detection_coreml():
        if args.coreml:
            from convert.convert_to_core_ml import convert_localization

            frozen_model = ".tmp/coreml_frozen_model.pb"

            graph = strip_and_freeze_model(
                saved_model=args.saved_model,
                output_path=frozen_model,
                input_node_names=["Preprocessor/sub"],
                output_node_names=["Squeeze", "Postprocessor/convert_scores"],
            )

            anchors = get_anchors(graph)

            convert_localization(
                frozen_model=frozen_model,
                labels_path=labels_path,
                output_path=args.mlmodel_path,
                anchors=anchors,
            )

    @attempt_conversion("object detection", "TensorFlow Lite")
    def convert_object_detection_tflite():
        if args.tflite:
            from convert.convert_to_tflite import convert_localization

            frozen_model = ".tmp/tflite_frozen_model.pb"

            graph = strip_and_freeze_model(
                saved_model=args.saved_model,
                output_path=frozen_model,
                input_node_names=["Preprocessor/sub"],
                output_node_names=["Squeeze", "Postprocessor/convert_scores"],
            )

            anchors = get_anchors(graph)

            convert_localization(
                frozen_model=frozen_model,
                labels_path=labels_path,
                output_path=args.tflite_path,
                anchors=anchors,
            )

    @attempt_conversion("object detection", "TensorFlow.js")
    def convert_object_detection_tfjs():
        if args.tfjs:
            from convert.convert_to_tfjs import convert_localization

            frozen_model = ".tmp/tfjs_frozen_model.pb"

            strip_and_freeze_model(
                saved_model=args.saved_model,
                output_path=frozen_model,
                input_node_names=[],
                output_node_names=["Postprocessor/ExpandDims_1", "Postprocessor/Slice"],
            )

            convert_localization(
                frozen_model=frozen_model,
                labels_path=labels_path,
                output_path=args.tfjs_path,
            )


################################################################################
# Classification
################################################################################
if args.model_type == "classification":
    labels_path = os.path.join(args.saved_model, "labels.txt")

    @attempt_conversion("classification", "Core ML")
    def convert_classification_coreml():
        if args.coreml:
            from convert.convert_to_core_ml import convert_classification

            frozen_model = ".tmp/coreml_frozen_model.pb"

            strip_and_freeze_model(
                saved_model=args.saved_model,
                output_path=frozen_model,
                input_node_names=["Placeholder"],
                output_node_names=["final_result"],
            )

            convert_classification(
                frozen_model=frozen_model,
                labels_path=labels_path,
                output_path=args.mlmodel_path,
            )

    @attempt_conversion("classification", "TensorFlow Lite")
    def convert_classification_tflite():
        if args.tflite:
            from convert.convert_to_tflite import convert_classification

            frozen_model = ".tmp/tflite_frozen_model.pb"

            strip_and_freeze_model(
                saved_model=args.saved_model,
                output_path=frozen_model,
                input_node_names=["Placeholder"],
                output_node_names=["final_result"],
            )

            convert_classification(
                frozen_model=frozen_model,
                labels_path=labels_path,
                output_path=args.tflite_path,
            )

    @attempt_conversion("classification", "TensorFlow.js")
    def convert_classification_tfjs():
        if args.tfjs:
            from convert.convert_to_tfjs import convert_classification

            frozen_model = ".tmp/tfjs_frozen_model.pb"

            strip_and_freeze_model(
                saved_model=args.saved_model,
                output_path=frozen_model,
                input_node_names=["Placeholder"],
                output_node_names=["final_result"],
            )

            convert_classification(
                frozen_model=frozen_model,
                labels_path=labels_path,
                output_path=args.tfjs_path,
            )
