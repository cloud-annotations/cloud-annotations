import os
import io
import json
import random
import hashlib
import shutil
import tarfile

import six.moves.urllib as urllib

import contextlib2
import PIL.Image
import tensorflow as tf

from object_detection.dataset_tools import tf_record_creation_util
from object_detection.utils import dataset_util

read_dir = ""
write_dir = ""
try:
    read_dir = os.environ["DATA_DIR"]
    write_dir = os.environ["RESULT_DIR"]
except Exception:
    pass


def main(read_bucket=read_dir, write_bucket=write_dir):
    ############################################################################
    # Prepare Directories
    ############################################################################
    def create_dir(base, dirName):
        path = os.path.join(base, dirName)
        if os.path.exists(path) and os.path.isdir(path):
            shutil.rmtree(path)
        os.makedirs(path)
        return path

    data_dir = create_dir("", "data")
    checkpoint_dir = create_dir(write_dir, "checkpoints")

    ############################################################################
    # Create LabelMap Proto
    ############################################################################
    annotations_file = os.path.join(read_bucket, "_annotations.json")

    with open(annotations_file) as f:
        annotations = json.load(f)["annotations"]

    labels = list(
        {annotation["label"] for image in annotations.values() for annotation in image}
    )

    label_map_path = os.path.join(data_dir, "label_map.pbtxt")

    with open(label_map_path, "w") as file:
        for idx, label in enumerate(labels):
            file.write("item {\n")
            file.write("\tname: '{}'\n".format(label))
            file.write("\tid: {}\n".format(idx + 1))  # indexes must start at 1.
            file.write("}\n")

    ############################################################################
    # Create TF Records
    ############################################################################
    image_files = [image for image in annotations.keys()]

    train_shards = 10
    val_shards = 10
    random.seed(42)
    random.shuffle(image_files)
    num_train = int(0.7 * len(image_files))
    train_examples = image_files[:num_train]
    val_examples = image_files[num_train:]
    print(
        "{} training and {} validation examples.".format(
            len(train_examples), len(val_examples)
        )
    )

    train_output_path = os.path.join(data_dir, "train.record")
    val_output_path = os.path.join(data_dir, "val.record")

    def create_tf_record(output_filename, num_shards, examples):
        with contextlib2.ExitStack() as tf_record_close_stack:
            output_tfrecords = tf_record_creation_util.open_sharded_output_tfrecords(
                tf_record_close_stack, output_filename, num_shards
            )
            for idx, example in enumerate(examples):
                try:
                    img_path = os.path.join(read_bucket, example)
                    if not os.path.isfile(img_path):
                        continue
                    with tf.gfile.GFile(img_path, "rb") as fid:
                        encoded_jpg = fid.read()
                    encoded_jpg_io = io.BytesIO(encoded_jpg)
                    image = PIL.Image.open(encoded_jpg_io)
                    if image.format != "JPEG":
                        raise ValueError("Image format not JPEG")
                    key = hashlib.sha256(encoded_jpg).hexdigest()

                    width, height = image.size

                    xmins = []
                    xmaxs = []
                    ymins = []
                    ymaxs = []
                    classes_text = []  # 'coke', 'pepsi', 'coke'...
                    classes = []  # 1, 2, 1...
                    difficult_obj = []
                    truncated = []
                    poses = []

                    for annotation in annotations[example]:
                        if (
                            "x" in annotation
                            and "x2" in annotation
                            and "y" in annotation
                            and "y2" in annotation
                        ):
                            xmins.append(annotation["x"])
                            xmaxs.append(annotation["x2"])
                            ymins.append(annotation["y"])
                            ymaxs.append(annotation["y2"])
                            classes_text.append(annotation["label"].encode("utf8"))
                            classes.append(
                                1
                            )  # temporary, I need to assign labels to actual ids
                            difficult_obj.append(0)
                            truncated.append(0)
                            poses.append("".encode("utf8"))

                    feature_dict = {
                        "image/height": dataset_util.int64_feature(height),
                        "image/width": dataset_util.int64_feature(width),
                        "image/filename": dataset_util.bytes_feature(
                            example.encode("utf8")
                        ),
                        "image/source_id": dataset_util.bytes_feature(
                            example.encode("utf8")
                        ),
                        "image/key/sha256": dataset_util.bytes_feature(
                            key.encode("utf8")
                        ),
                        "image/encoded": dataset_util.bytes_feature(encoded_jpg),
                        "image/format": dataset_util.bytes_feature(
                            "jpeg".encode("utf8")
                        ),
                        "image/object/bbox/xmin": dataset_util.float_list_feature(
                            xmins
                        ),
                        "image/object/bbox/xmax": dataset_util.float_list_feature(
                            xmaxs
                        ),
                        "image/object/bbox/ymin": dataset_util.float_list_feature(
                            ymins
                        ),
                        "image/object/bbox/ymax": dataset_util.float_list_feature(
                            ymaxs
                        ),
                        "image/object/class/text": dataset_util.bytes_list_feature(
                            classes_text
                        ),
                        "image/object/class/label": dataset_util.int64_list_feature(
                            classes
                        ),
                        "image/object/difficult": dataset_util.int64_list_feature(
                            difficult_obj
                        ),
                        "image/object/truncated": dataset_util.int64_list_feature(
                            truncated
                        ),
                        "image/object/view": dataset_util.bytes_list_feature(poses),
                    }
                    tf_example = tf.train.Example(
                        features=tf.train.Features(feature=feature_dict)
                    )
                    if tf_example:
                        shard_idx = idx % num_shards
                        output_tfrecords[shard_idx].write(
                            tf_example.SerializeToString()
                        )
                except ValueError:
                    print("Invalid example, ignoring.")

    create_tf_record(train_output_path, train_shards, train_examples)
    create_tf_record(val_output_path, val_shards, val_examples)

    ############################################################################
    # Extract Model Checkpoint
    ############################################################################
    download_base = "https://max-cdn.cdn.appdomain.cloud/max-object-detector/1.0.1/"
    model_file = "ssd_mobilenet_v1_coco_2018_01_28.tar.gz"

    tar_path = os.path.join("", model_file)

    if not os.path.exists(tar_path):
        print("Downloading model checkpoint...")
        opener = urllib.request.URLopener()
        opener.retrieve(download_base + model_file, tar_path)
    else:
        print("Model checkpoint found.")

    with tarfile.open(tar_path) as tar:
        for member in tar.getmembers():
            # Flatten the directory.
            member.name = os.path.basename(member.name)
            if "model.ckpt" in member.name:
                print("Extracting {}...".format(member.name))
                tar.extract(member, path=checkpoint_dir)

    ############################################################################
    # Create pipeline.config
    ############################################################################
    fill_num_classes = str(len(labels))
    fill_label_map = label_map_path
    fill_train_record = train_output_path + "-?????-of-{:05}".format(train_shards)
    fill_val_record = val_output_path + "-?????-of-{:05}".format(val_shards)
    fill_checkpoint = os.path.join(checkpoint_dir, "model.ckpt")

    skeleton_path = "pipeline_skeleton.config"
    pipeline_path = "pipeline.config"

    with open(skeleton_path, "r") as skeleton:
        with open(pipeline_path, "w") as pipeline:
            for line in skeleton:
                new_line = line.replace("${NUM_CLASSES}", fill_num_classes)
                new_line = new_line.replace("${LABEL_MAP}", fill_label_map)
                new_line = new_line.replace("${TRAIN_RECORD}", fill_train_record)
                new_line = new_line.replace("${VAL_RECORD}", fill_val_record)
                new_line = new_line.replace("${CHECKPOINT}", fill_checkpoint)
                pipeline.write(new_line)


if __name__ == "__main__":
    main()
