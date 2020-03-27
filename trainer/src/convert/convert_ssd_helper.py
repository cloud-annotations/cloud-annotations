import os
import json

from convert.build_nms import build_nms
from convert.build_decoder import build_decoder
from convert.build_decoder import get_anchors

import tfcoreml
import coremltools
import numpy as np
import tensorflow as tf
from pkg_resources import parse_version

from tensorflow.python.tools import strip_unused_lib
from tensorflow.python.framework import dtypes
from tensorflow.python.platform import gfile
from coremltools.models.pipeline import Pipeline
from coremltools.models import datatypes

from convert.TFLiteConverter import convert


def optimize_graph(input_path, output_path, input_nodes, output_nodes):
    graph = tf.Graph()
    with tf.Session(graph=graph) as sess:
        tf.saved_model.loader.load(sess, [tf.saved_model.SERVING], input_path)

    gdef = strip_unused_lib.strip_unused(
        input_graph_def=graph.as_graph_def(),
        input_node_names=input_nodes,
        output_node_names=output_nodes,
        placeholder_type_enum=dtypes.float32.as_datatype_enum)
    with gfile.GFile(output_path, 'wb') as f:
        f.write(gdef.SerializeToString())
    return graph


def convert_ssd_tflite(saved_model_path, model_structure, output_path):
    num_anchors = 1917

    tflite_model_path = os.path.join(output_path, 'model.tflite')

    # Strip the model down to something usable by Core ML.
    # Instead of `concat_1`, use `Postprocessor/convert_scores`, because it
    # applies the sigmoid to the class scores.
    frozen_model_path = '.tmp/tmp_frozen_graph.pb'
    input_node = 'Preprocessor/sub'
    bbox_output_node = 'Squeeze'
    class_output_node = 'Postprocessor/convert_scores'
    graph = optimize_graph(saved_model_path, frozen_model_path, [
                           input_node], [bbox_output_node, class_output_node])

    # Convert to tflite model.
    input_arrays = [input_node]
    output_arrays = [bbox_output_node, class_output_node]

    converter = convert.from_frozen_graph(
        frozen_model_path,
        input_arrays=input_arrays,
        output_arrays=output_arrays,
        input_shapes={'Preprocessor/sub': [1, 300, 300, 3]})
    # converter.allow_custom_ops = True
    tflite_model = converter.convert()
    with open(tflite_model_path, 'wb') as f:
        f.write(tflite_model)

    anchors = get_anchors(graph)
    anchors = np.swapaxes(anchors, 0, 1)
    with open(os.path.join(output_path, 'anchors.json'), 'w') as f:
        json.dump(anchors.tolist(), f)


def convert_ssd(saved_model_path, model_structure, output_path):
    num_anchors = 1917

    coreml_model_path = os.path.join(output_path, 'Model.mlmodel')

    json_labels = os.path.join(saved_model_path, 'labels.json')
    with open(json_labels) as f:
        labels = json.load(f)

    # Strip the model down to something usable by Core ML.
    # Instead of `concat_1`, use `Postprocessor/convert_scores`, because it
    # applies the sigmoid to the class scores.
    frozen_model_path = '.tmp/tmp_frozen_graph.pb'
    input_node = 'Preprocessor/sub'
    bbox_output_node = 'Squeeze'
    class_output_node = 'Postprocessor/convert_scores'
    graph = optimize_graph(saved_model_path, frozen_model_path, [
                           input_node], [bbox_output_node, class_output_node])

    # Convert to Core ML model.
    ssd_model = tfcoreml.convert(
        tf_model_path=frozen_model_path,
        mlmodel_path=coreml_model_path,
        input_name_shape_dict={'Preprocessor/sub': [1, 300, 300, 3]},
        image_input_names=['Preprocessor/sub'],
        output_feature_names=['Squeeze', 'Postprocessor/convert_scores'],
        is_bgr=False,
        red_bias=-1.0,
        green_bias=-1.0,
        blue_bias=-1.0,
        image_scale=2./255,
        minimum_ios_deployment_target='13')

    spec = ssd_model.get_spec()

    input_mlmodel = 'Preprocessor/sub'
    class_output_mlmodel = 'Postprocessor/convert_scores'
    bbox_output_mlmodel = 'Squeeze'

    # Rename the inputs and outputs to something more readable.
    spec.description.input[0].name = 'image'
    spec.description.input[0].shortDescription = 'Input image'
    spec.neuralNetwork.preprocessing[0].featureName = 'image'

    for i in range(len(spec.description.output)):
        if spec.description.output[i].name == bbox_output_mlmodel:
            spec.description.output[i].name = 'boxes'
            spec.description.output[i].shortDescription = 'Predicted coordinates for each bounding box'
            spec.description.output[i].type.multiArrayType.shape[:] = [
                4, num_anchors, 1]

        if spec.description.output[i].name == class_output_mlmodel:
            spec.description.output[i].name = 'scores'
            spec.description.output[i].shortDescription = 'Predicted class scores for each bounding box'
            spec.description.output[i].type.multiArrayType.shape[:] = [
                len(labels) + 1, num_anchors, 1]

    for i in range(len(spec.neuralNetwork.layers)):
        # Assumes everything only has 1 input or output...
        if spec.neuralNetwork.layers[i].input[0] == input_mlmodel:
            spec.neuralNetwork.layers[i].input[0] = 'image'
        if spec.neuralNetwork.layers[i].output[0] == class_output_mlmodel:
            spec.neuralNetwork.layers[i].output[0] = 'scores'
        if spec.neuralNetwork.layers[i].output[0] == bbox_output_mlmodel:
            spec.neuralNetwork.layers[i].output[0] = 'boxes'

    def _convert_multiarray_to_float32(feature):
        from coremltools.proto import FeatureTypes_pb2 as ft
        if feature.type.HasField('multiArrayType'):
            feature.type.multiArrayType.dataType = ft.ArrayFeatureType.DOUBLE

    for input_ in spec.description.input:
        _convert_multiarray_to_float32(input_)
    for output_ in spec.description.output:
        _convert_multiarray_to_float32(output_)

    # Convert weights to 16-bit floats to make the model smaller.
    spec = coremltools.utils.convert_neural_network_spec_weights_to_fp16(spec)

    input_features = [
        ('image', datatypes.Array(3, 300, 300)),
        ('iouThreshold', datatypes.Double()),
        ('confidenceThreshold', datatypes.Double())
    ]

    output_features = ['confidence', 'coordinates']

    pipeline = Pipeline(input_features, output_features)

    # Create a new MLModel from the modified spec and save it.
    ssd_model = coremltools.models.MLModel(spec)
    decoder_model = build_decoder(graph, len(labels), num_anchors)
    nms_model = build_nms(decoder_model, labels)

    pipeline.add_model(ssd_model)
    pipeline.add_model(decoder_model)
    pipeline.add_model(nms_model)

    # The `image` input should really be an image, not a multi-array.
    pipeline.spec.description.input[0].ParseFromString(
        ssd_model._spec.description.input[0].SerializeToString())

    # Copy the declarations of the `confidence` and `coordinates` outputs.
    # The Pipeline makes these strings by default.
    pipeline.spec.description.output[0].ParseFromString(
        nms_model._spec.description.output[0].SerializeToString())
    pipeline.spec.description.output[1].ParseFromString(
        nms_model._spec.description.output[1].SerializeToString())

    # Add descriptions to the inputs and outputs.
    pipeline.spec.description.input[1].shortDescription = '(optional) IOU Threshold override'
    pipeline.spec.description.input[2].shortDescription = '(optional) Confidence Threshold override'
    pipeline.spec.description.output[0].shortDescription = u'Boxes \xd7 Class confidence'
    pipeline.spec.description.output[
        1].shortDescription = u'Boxes \xd7 [x, y, width, height] (relative to image size)'

    # Add metadata to the model.
    pipeline.spec.description.metadata.versionString = 'ssd_mobilenet'
    pipeline.spec.description.metadata.shortDescription = 'MobileNet + SSD'
    pipeline.spec.description.metadata.author = 'Converted to Core ML by Cloud Annotations'
    pipeline.spec.description.metadata.license = 'https://github.com/tensorflow/models/blob/master/research/object_detection'

    # Add the list of class labels and the default threshold values too.
    user_defined_metadata = {
        'iou_threshold': str(0.5),
        'confidence_threshold': str(0.5),
        'classes': ','.join(labels)
    }
    pipeline.spec.description.metadata.userDefined.update(
        user_defined_metadata)

    pipeline.spec.specificationVersion = 4

    final_model = coremltools.models.MLModel(pipeline.spec)
    final_model.save(coreml_model_path)
