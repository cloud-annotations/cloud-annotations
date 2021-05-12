import argparse
import json

from object_detection.utils.label_map_util import get_label_map_dict


parser = argparse.ArgumentParser()
parser.add_argument("--label_map_path", type=str)
parser.add_argument("--output_label_path", type=str)
args = parser.parse_args()


def main():
    label_map = get_label_map_dict(args.label_map_path)
    label_array = [k for k in sorted(label_map, key=label_map.get)]
    with open(args.output_label_path, "w") as f:
        json.dump(label_array, f)


if __name__ == "__main__":
    main()
