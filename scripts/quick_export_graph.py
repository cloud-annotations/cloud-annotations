import os
import re
import shutil
import json
from datetime import datetime

import tensorflow as tf
from google.protobuf import text_format
from object_detection import exporter
from object_detection.protos import pipeline_pb2
from object_detection.utils.label_map_util import get_label_map_dict
from object_detection.builders import model_builder

slim = tf.contrib.slim
flags = tf.app.flags

flags.DEFINE_string('input_type', 'image_tensor', 'Type of input node. Can be '
                    'one of [`image_tensor`, `encoded_image_string_tensor`, '
                    '`tf_example`]')
flags.DEFINE_string('input_shape', None,
                    'If input_type is `image_tensor`, this can explicitly set '
                    'the shape of this input tensor to a fixed size. The '
                    'dimensions are to be provided as a comma-separated list '
                    'of integers. A value of -1 can be used for unknown '
                    'dimensions. If not specified, for an `image_tensor, the '
                    'default shape will be partially specified as '
                    '`[None, None, None, 3]`.')
flags.DEFINE_string('result_base', '.tmp',
                    'Path to a string_int_label_map_pb2.StringIntLabelMapItem '
                    'file.')
flags.DEFINE_string('pipeline_config_path', 'pipeline.config',
                    'Path to a pipeline_pb2.TrainEvalPipelineConfig config '
                    'file.')
flags.DEFINE_string('label_map_path', 'data/label_map.pbtxt',
                    'Path to a string_int_label_map_pb2.StringIntLabelMapItem '
                    'file.')
flags.DEFINE_string('trained_checkpoint_path', 'checkpoint',
                    'Path to trained checkpoint, typically of the form '
                    'path/to/checkpoints')
flags.DEFINE_string('trained_checkpoint_prefix', None,
                    'Path to trained checkpoint, typically of the form '
                    'path/to/model.ckpt')
flags.DEFINE_string('model_dir', 'exported_graph', 'Path to write outputs.')
flags.DEFINE_string('output_label_path', 'labels.json', 'Path to write outputs.')
flags.DEFINE_string('config_override', '',
                    'pipeline_pb2.TrainEvalPipelineConfig '
                    'text proto to override pipeline_config_path.')
flags.DEFINE_boolean('write_inference_graph', False,
                     'If true, writes inference graph to disk.')
FLAGS = flags.FLAGS

def output_anchors_as_swift(anchors) :
  with open(os.path.join(FLAGS.model_dir, 'Anchors.swift'), 'w') as anchor_file:
    anchor_file.write('//\n')
    anchor_file.write('//\tAnchors.swift\n')
    anchor_file.write('//\tCloud Annotations\n')
    anchor_file.write('//\n')
    anchor_file.write('//\tGenerated on {}.\n'.format(datetime.now().strftime("%m/%d/%y")))
    anchor_file.write('//\n\n')
    anchor_file.write('struct Anchors {\n')
    anchor_file.write('\tstatic let numAnchors = 1917\n')
    anchor_file.write('\tstatic var ssdAnchors: [[Float32]] {\n')
    anchor_file.write('\t\tvar arr: [[Float32]] = Array(repeating: Array(repeating: 0.0, count: 4), count: numAnchors)\n')
    anchor_file.write('\n')

    for idx, anchor in enumerate(anchors):
      anchor_file.write('\t\tarr[{}] = [ {: .8f}, {: .8f}, {: .8f}, {: .8f} ]\n'.format(
          idx, anchor[0], anchor[1], anchor[2] ,anchor[3]))
        
    anchor_file.write('\n')
    anchor_file.write('\t\treturn arr\n')
    anchor_file.write('\t}\n')
    anchor_file.write('}\n')

def main(_):
  pipeline_config = pipeline_pb2.TrainEvalPipelineConfig()
  with tf.gfile.GFile(os.path.join(FLAGS.result_base, FLAGS.pipeline_config_path), 'r') as f:
    text_format.Merge(f.read(), pipeline_config)
  text_format.Merge(FLAGS.config_override, pipeline_config)
  if FLAGS.input_shape:
    input_shape = [
        int(dim) if dim != '-1' else None
        for dim in FLAGS.input_shape.split(',')
    ]
  else:
    input_shape = None

  if os.path.exists(FLAGS.model_dir) and os.path.isdir(FLAGS.model_dir):
    shutil.rmtree(FLAGS.model_dir)
  
  if not FLAGS.trained_checkpoint_prefix:
    path = os.path.join(FLAGS.result_base, FLAGS.trained_checkpoint_path)
    regex = re.compile(r"model\.ckpt-([0-9]+)\.index")
    numbers = [int(regex.search(f).group(1)) for f in os.listdir(path) if regex.search(f)]
    if not numbers:
      print('No checkpoint found!')
      exit()
    trained_checkpoint_prefix = os.path.join(path, 'model.ckpt-{}'.format(max(numbers)))
  else:
   trained_checkpoint_prefix = FLAGS.trained_checkpoint_prefix

  exporter.export_inference_graph(
      FLAGS.input_type, pipeline_config, trained_checkpoint_prefix,
      FLAGS.model_dir, input_shape=input_shape,
      write_inference_graph=FLAGS.write_inference_graph)

  tf.reset_default_graph()
  detection_model = model_builder.build(pipeline_config.model, is_training=False)
  exporter._build_detection_graph(
      input_type=FLAGS.input_type,
      detection_model=detection_model,
      input_shape=input_shape,
      output_collection_name='inference_op',
      graph_hook_fn=None)
  
  with tf.Session() as sess:
    boxes = detection_model.anchors.get()
    anchors = boxes.eval(session=sess)
    output_anchors_as_swift(anchors)

  label_map = get_label_map_dict(os.path.join(FLAGS.result_base, FLAGS.label_map_path))
  label_array = [k for k in sorted(label_map, key=label_map.get)]
  with open(os.path.join(FLAGS.model_dir, FLAGS.output_label_path), 'w') as f:
    json.dump(label_array, f)


if __name__ == '__main__':
  tf.app.run()
