import os
import json
import shutil

def convert_to_tfjs(exported_graph_path, output_names, output_path):
    from tensorflowjs.converters import convert_tf_saved_model

    saved_model_path = os.path.join(exported_graph_path, 'saved_model')
    output_names_str = ','.join(output_names)

    try:    
        convert_tf_saved_model(
            saved_model_path,
            output_names_str,
            output_path,
            saved_model_tags='serve',
            quantization_dtype=None,
            skip_op_check=False,
            strip_debug_ops=True)
    except Exception as err:
        print('Error: {}'.format(err))

    # Move the labels to the model directory.
    json_labels = os.path.join(exported_graph_path, 'labels.json')
    text_labels = os.path.join(exported_graph_path, 'labels.txt')
    if not os.path.isfile(json_labels):
        with open(text_labels, 'r') as f:
            labels = f.read()
        labels = list(filter(bool, [s.strip() for s in labels.splitlines()]))
        with open(os.path.join(output_path, 'labels.json'), 'w') as f:
            json.dump(labels, f)
    else:
        shutil.copy2(json_labels, output_path)