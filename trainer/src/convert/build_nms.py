import coremltools


def build_nms(
    decoder_model, labels, default_iou_threshold=0.5, default_confidence_threshold=0.5
):
    nms_spec = coremltools.proto.Model_pb2.Model()
    nms_spec.specificationVersion = 3

    for i in range(2):
        decoder_output = decoder_model._spec.description.output[i].SerializeToString()

        nms_spec.description.input.add()
        nms_spec.description.input[i].ParseFromString(decoder_output)

        nms_spec.description.output.add()
        nms_spec.description.output[i].ParseFromString(decoder_output)

    nms_spec.description.output[0].name = "confidence"
    nms_spec.description.output[1].name = "coordinates"

    output_sizes = [len(labels), 4]
    for i in range(2):
        ma_type = nms_spec.description.output[i].type.multiArrayType
        ma_type.shapeRange.sizeRanges.add()
        ma_type.shapeRange.sizeRanges[0].lowerBound = 0
        ma_type.shapeRange.sizeRanges[0].upperBound = -1
        ma_type.shapeRange.sizeRanges.add()
        ma_type.shapeRange.sizeRanges[1].lowerBound = output_sizes[i]
        ma_type.shapeRange.sizeRanges[1].upperBound = output_sizes[i]
        del ma_type.shape[:]

    nms = nms_spec.nonMaximumSuppression
    nms.confidenceInputFeatureName = "raw_confidence"
    nms.coordinatesInputFeatureName = "raw_coordinates"
    nms.confidenceOutputFeatureName = "confidence"
    nms.coordinatesOutputFeatureName = "coordinates"
    nms.iouThresholdInputFeatureName = "iouThreshold"
    nms.confidenceThresholdInputFeatureName = "confidenceThreshold"

    nms.iouThreshold = default_iou_threshold
    nms.confidenceThreshold = default_confidence_threshold

    nms.pickTop.perClass = True
    nms.stringClassLabels.vector.extend(labels)

    return coremltools.models.MLModel(nms_spec)
