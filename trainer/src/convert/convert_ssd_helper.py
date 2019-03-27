import os
import json

from convert.build_nms import build_nms
from convert.build_decoder import build_decoder

import tfcoreml
import coremltools
import numpy as np
import tensorflow as tf

from tensorflow.python.tools import strip_unused_lib
from tensorflow.python.framework import dtypes
from tensorflow.python.platform import gfile
from coremltools.models.pipeline import Pipeline
from coremltools.models import datatypes


def optimize_graph(input_path, output_path, input_nodes, output_nodes):
    graph = tf.Graph()
    with tf.Session(graph=graph) as sess:
        tf.saved_model.loader.load(sess, [tf.saved_model.tag_constants.SERVING], input_path)

    gdef = strip_unused_lib.strip_unused(
        input_graph_def=graph.as_graph_def(),
        input_node_names=input_nodes,
        output_node_names=output_nodes,
        placeholder_type_enum=dtypes.float32.as_datatype_enum)
    with gfile.GFile(output_path, 'wb') as f:
        f.write(gdef.SerializeToString())
    return graph


def convert_ssd(exported_graph_path, model_structure, output_path):
    num_anchors = 1917

    saved_model_path = os.path.join(exported_graph_path, 'saved_model')
    coreml_model_path = os.path.join(output_path, 'Model.mlmodel')

    json_labels = os.path.join(exported_graph_path, 'labels.json')
    with open(json_labels) as f:
        labels = json.load(f)

    # Strip the model down to something usable by Core ML.
    # Instead of `concat_1`, use `Postprocessor/convert_scores`, because it
    # applies the sigmoid to the class scores.
    frozen_model_path = '.tmp/tmp_frozen_graph.pb'
    input_node = 'Preprocessor/sub'
    bbox_output_node = 'concat'
    class_output_node = 'Postprocessor/convert_scores'    
    graph = optimize_graph(saved_model_path, frozen_model_path, [input_node], [bbox_output_node, class_output_node])

    # conversion tensors have a `:0` at the end of the name
    input_tensor = input_node + ':0'
    bbox_output_tensor = bbox_output_node + ':0'
    class_output_tensor = class_output_node + ':0'

    # Convert to Core ML model.
    ssd_model = tfcoreml.convert(
        tf_model_path=frozen_model_path,
        mlmodel_path=coreml_model_path,
        input_name_shape_dict={ input_tensor: [1, 300, 300, 3] },
        image_input_names=input_tensor,
        output_feature_names=[bbox_output_tensor, class_output_tensor],
        is_bgr=False,
        red_bias=-1.0,
        green_bias=-1.0,
        blue_bias=-1.0,
        image_scale=2./255)

    spec = ssd_model.get_spec()

    # Rename the inputs and outputs to something more readable.
    spec.description.input[0].name = 'image'
    spec.description.input[0].shortDescription = 'Input image'
    spec.description.output[0].name = 'scores'
    spec.description.output[0].shortDescription = 'Predicted class scores for each bounding box'
    spec.description.output[1].name = 'boxes'
    spec.description.output[1].shortDescription = 'Predicted coordinates for each bounding box'

    input_mlmodel = input_tensor.replace(':', '__').replace('/', '__')
    class_output_mlmodel = class_output_tensor.replace(':', '__').replace('/', '__')
    bbox_output_mlmodel = bbox_output_tensor.replace(':', '__').replace('/', '__')

    for i in range(len(spec.neuralNetwork.layers)):
        if spec.neuralNetwork.layers[i].input[0] == input_mlmodel:
            spec.neuralNetwork.layers[i].input[0] = 'image'
        if spec.neuralNetwork.layers[i].output[0] == class_output_mlmodel:
            spec.neuralNetwork.layers[i].output[0] = 'scores'
        if spec.neuralNetwork.layers[i].output[0] == bbox_output_mlmodel:
            spec.neuralNetwork.layers[i].output[0] = 'boxes'

    spec.neuralNetwork.preprocessing[0].featureName = 'image'

    # For some reason the output shape of the `scores` output is not filled in.
    spec.description.output[0].type.multiArrayType.shape.append(len(labels) + 1)
    spec.description.output[0].type.multiArrayType.shape.append(num_anchors)

    # And the `boxes` output shape is (4, 1917, 1) so get rid of that last one.
    del spec.description.output[1].type.multiArrayType.shape[-1]

    # Convert weights to 16-bit floats to make the model smaller.
    spec = coremltools.utils.convert_neural_network_spec_weights_to_fp16(spec)

    # Create a new MLModel from the modified spec and save it.
    ssd_model = coremltools.models.MLModel(spec)

    decoder_model = build_decoder(graph, len(labels), num_anchors)
    nms_model = build_nms(decoder_model, labels)

    input_features = [
        ('image', datatypes.Array(3, 300, 300)),
        ('iouThreshold', datatypes.Double()),
        ('confidenceThreshold', datatypes.Double())
    ]

    output_features = ['confidence', 'coordinates']

    pipeline = Pipeline(input_features, output_features)

    # We added a dimension of size 1 to the back of the inputs of the decoder 
    # model, so we should also add this to the output of the SSD model or else 
    # the inputs and outputs do not match and the pipeline is not valid.
    ssd_output = ssd_model._spec.description.output
    ssd_output[0].type.multiArrayType.shape[:] = [len(labels) + 1, num_anchors, 1]
    ssd_output[1].type.multiArrayType.shape[:] = [4, num_anchors, 1]

    pipeline.add_model(ssd_model)
    pipeline.add_model(decoder_model)
    pipeline.add_model(nms_model)

    # The `image` input should really be an image, not a multi-array.
    pipeline.spec.description.input[0].ParseFromString(ssd_model._spec.description.input[0].SerializeToString())

    # Copy the declarations of the `confidence` and `coordinates` outputs.
    # The Pipeline makes these strings by default.
    pipeline.spec.description.output[0].ParseFromString(nms_model._spec.description.output[0].SerializeToString())
    pipeline.spec.description.output[1].ParseFromString(nms_model._spec.description.output[1].SerializeToString())

    # Add descriptions to the inputs and outputs.
    pipeline.spec.description.input[1].shortDescription = '(optional) IOU Threshold override'
    pipeline.spec.description.input[2].shortDescription = '(optional) Confidence Threshold override'
    pipeline.spec.description.output[0].shortDescription = u'Boxes \xd7 Class confidence'
    pipeline.spec.description.output[1].shortDescription = u'Boxes \xd7 [x, y, width, height] (relative to image size)'

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
    pipeline.spec.description.metadata.userDefined.update(user_defined_metadata)

    pipeline.spec.specificationVersion = 3

    final_model = coremltools.models.MLModel(pipeline.spec)
    final_model.save(coreml_model_path)
