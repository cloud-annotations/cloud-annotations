import coremltools
import numpy as np

from coremltools.models import datatypes
from coremltools.models import neural_network


def build_decoder(anchors, num_classes, num_anchors):
    # MLMultiArray inputs of neural networks must have 1 or 3 dimensions.
    # We only have 2, so add an unused dimension of size one at the back.
    input_features = [
        ("scores", datatypes.Array(num_classes + 1, num_anchors, 1)),
        ("boxes", datatypes.Array(4, num_anchors, 1)),
    ]

    # The outputs of the decoder model should match the inputs of the next
    # model in the pipeline, NonMaximumSuppression. This expects the number
    # of bounding boxes in the first dimension.
    output_features = [
        ("raw_confidence", datatypes.Array(num_anchors, num_classes)),
        ("raw_coordinates", datatypes.Array(num_anchors, 4)),
    ]

    builder = neural_network.NeuralNetworkBuilder(input_features, output_features)

    # (num_classes+1, num_anchors, 1) --> (1, num_anchors, num_classes+1)
    builder.add_permute(
        name="permute_scores",
        dim=(0, 3, 2, 1),
        input_name="scores",
        output_name="permute_scores_output",
    )

    # Strip off the "unknown" class (at index 0).
    builder.add_slice(
        name="slice_scores",
        input_name="permute_scores_output",
        output_name="raw_confidence",
        axis="width",
        start_index=1,
        end_index=num_classes + 1,
    )

    # Grab the y, x coordinates (channels 0-1).
    builder.add_slice(
        name="slice_yx",
        input_name="boxes",
        output_name="slice_yx_output",
        axis="channel",
        start_index=0,
        end_index=2,
    )

    # boxes_yx / 10
    builder.add_elementwise(
        name="scale_yx",
        input_names="slice_yx_output",
        output_name="scale_yx_output",
        mode="MULTIPLY",
        alpha=0.1,
    )

    # Split the anchors into two (2, 1917, 1) arrays.
    anchors_yx = np.expand_dims(anchors[:2, :], axis=-1)
    anchors_hw = np.expand_dims(anchors[2:, :], axis=-1)

    builder.add_load_constant(
        name="anchors_yx",
        output_name="anchors_yx",
        constant_value=anchors_yx,
        shape=[2, num_anchors, 1],
    )

    builder.add_load_constant(
        name="anchors_hw",
        output_name="anchors_hw",
        constant_value=anchors_hw,
        shape=[2, num_anchors, 1],
    )

    # (boxes_yx / 10) * anchors_hw
    builder.add_elementwise(
        name="yw_times_hw",
        input_names=["scale_yx_output", "anchors_hw"],
        output_name="yw_times_hw_output",
        mode="MULTIPLY",
    )

    # (boxes_yx / 10) * anchors_hw + anchors_yx
    builder.add_elementwise(
        name="decoded_yx",
        input_names=["yw_times_hw_output", "anchors_yx"],
        output_name="decoded_yx_output",
        mode="ADD",
    )

    # Grab the height and width (channels 2-3).
    builder.add_slice(
        name="slice_hw",
        input_name="boxes",
        output_name="slice_hw_output",
        axis="channel",
        start_index=2,
        end_index=4,
    )

    # (boxes_hw / 5)
    builder.add_elementwise(
        name="scale_hw",
        input_names="slice_hw_output",
        output_name="scale_hw_output",
        mode="MULTIPLY",
        alpha=0.2,
    )

    # exp(boxes_hw / 5)
    builder.add_unary(
        name="exp_hw",
        input_name="scale_hw_output",
        output_name="exp_hw_output",
        mode="exp",
    )

    # exp(boxes_hw / 5) * anchors_hw
    builder.add_elementwise(
        name="decoded_hw",
        input_names=["exp_hw_output", "anchors_hw"],
        output_name="decoded_hw_output",
        mode="MULTIPLY",
    )

    # The coordinates are now (y, x) and (height, width) but NonMaximumSuppression
    # wants them as (x, y, width, height). So create four slices and then concat
    # them into the right order.
    builder.add_slice(
        name="slice_y",
        input_name="decoded_yx_output",
        output_name="slice_y_output",
        axis="channel",
        start_index=0,
        end_index=1,
    )

    builder.add_slice(
        name="slice_x",
        input_name="decoded_yx_output",
        output_name="slice_x_output",
        axis="channel",
        start_index=1,
        end_index=2,
    )

    builder.add_slice(
        name="slice_h",
        input_name="decoded_hw_output",
        output_name="slice_h_output",
        axis="channel",
        start_index=0,
        end_index=1,
    )

    builder.add_slice(
        name="slice_w",
        input_name="decoded_hw_output",
        output_name="slice_w_output",
        axis="channel",
        start_index=1,
        end_index=2,
    )

    builder.add_elementwise(
        name="concat",
        input_names=[
            "slice_x_output",
            "slice_y_output",
            "slice_w_output",
            "slice_h_output",
        ],
        output_name="concat_output",
        mode="CONCAT",
    )

    # (4, num_anchors, 1) --> (1, num_anchors, 4)
    builder.add_permute(
        name="permute_output",
        dim=(0, 3, 2, 1),
        input_name="concat_output",
        output_name="raw_coordinates",
    )

    return coremltools.models.MLModel(builder.spec)
