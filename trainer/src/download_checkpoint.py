import os
import shutil
import tarfile

import six.moves.urllib as urllib


def main():
    checkpoint_dir = "checkpoints"

    if os.path.exists(checkpoint_dir) and os.path.isdir(checkpoint_dir):
        shutil.rmtree(checkpoint_dir)
    os.makedirs(checkpoint_dir)

    download_base = (
        "http://download.tensorflow.org/models/object_detection/tf2/20200711/"
    )
    model_file = "ssd_mobilenet_v2_320x320_coco17_tpu-8.tar.gz"

    tar_path = os.path.join("", model_file)

    if not os.path.exists(tar_path):
        opener = urllib.request.URLopener()
        opener.retrieve(download_base + model_file, tar_path)
    else:
        print("Model checkpoint found.")

    with tarfile.open(tar_path) as tar:
        for member in tar.getmembers():
            # Flatten the directory.
            member.name = os.path.basename(member.name)
            if "ckpt" in member.name:
                tar.extract(member, path=checkpoint_dir)


if __name__ == "__main__":
    main()
