from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import os
import shutil
import json

read_dir = ""
write_dir = ""
try:
    read_dir = os.environ["DATA_DIR"]
    write_dir = os.environ["RESULT_DIR"]
except Exception:
    pass


def main(read_bucket=read_dir, write_bucket=write_dir):
    def create_dir(base, dirName):
        path = os.path.join(base, dirName)
        if os.path.exists(path) and os.path.isdir(path):
            shutil.rmtree(path)
        os.makedirs(path)
        return path

    data_dir = create_dir("", "data")

    annotations_file = os.path.join(read_bucket, "_annotations.json")

    with open(annotations_file) as f:
        annotations = json.load(f)["annotations"]

    labels = list(
        {annotation["label"] for image in annotations.values() for annotation in image}
    )

    for label in labels:
        file_list = [
            image_name
            for image_name in annotations.keys()
            for annotation in annotations[image_name]
            if annotation["label"] == label
        ]

        # Make directory for labels, if they don't exist.
        train_label_dir = os.path.join(data_dir, label)
        if not os.path.exists(train_label_dir):
            os.makedirs(train_label_dir)

        # move files to their proper labels.
        for f in file_list:
            try:
                shutil.copy2(os.path.join(read_bucket, f), train_label_dir)
            except Exception as err:
                print("Error: {}, skipping {}...".format(err, f))


if __name__ == "__main__":
    main()
