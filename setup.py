"""Setup script"""

import tarfile
import zipfile
import shutil
import argparse
import os

from setuptools import setup, find_packages
from setuptools.command.sdist import sdist
from subprocess import call


PULL_OBJECT_DETECTION = """
  svn export -r 8436 https://github.com/tensorflow/models/trunk/research/object_detection &&
  svn export -r 8436 https://github.com/tensorflow/models/trunk/research/slim &&
  protoc object_detection/protos/*.proto --python_out=.
"""

PULL_CLASSIFICATION = """
  svn export -r 308 https://github.com/tensorflow/hub/trunk/examples/image_retraining classification
  echo > classification/__init__.py
"""

OUTPUT_FILE = 'training.zip'


parser = argparse.ArgumentParser()
parser.add_argument('type')
args = parser.parse_args()


class InstallCommand(sdist):
  def initialize_options(self):
    sdist.initialize_options(self)
    self.custom_option = None

  def finalize_options(self):
    sdist.finalize_options(self)

  def run(self):
    sdist.run(self)


def move_zip(zip_file, name):
  with tarfile.open('dist/{}-0.1.tar.gz'.format(name)) as tar:
    for member in tar.getmembers():
      if member.name.startswith('{}-0.1/{}/'.format(name, name)) and member.isfile():
        print('in: {}'.format(member.name))
        f = tar.extractfile(member)
        rel_path = os.path.relpath(member.name, '{}-0.1'.format(name))
        zip_file.writestr(rel_path, f.read())


def pack():
  with zipfile.ZipFile(OUTPUT_FILE, 'w', zipfile.ZIP_DEFLATED) as tf_model:
    if os.path.isfile('dist/slim-0.1.tar.gz') and os.path.isfile('dist/object_detection-0.1.tar.gz'):
      move_zip(tf_model, 'slim')
      move_zip(tf_model, 'object_detection')
      tf_model.write('bucket/prepare_data_object_detection.py')
      tf_model.write('bucket/pipeline_skeleton.config')
      tf_model.write('scripts/quick_export_graph.py')
      
    if os.path.isfile('dist/classification-0.1.tar.gz'):
      move_zip(tf_model, 'classification')
      tf_model.write('bucket/prepare_data_classification.py')

    tf_model.write('bucket/__init__.py')
    tf_model.write('wml/__init__.py')
    tf_model.write('wml/train_command.py')
    tf_model.write('scripts/__init__.py')
    tf_model.write('scripts/build_decoder.py')
    tf_model.write('scripts/build_nms.py')
    tf_model.write('scripts/convert_ssd_helper.py')
    tf_model.write('scripts/convert_to_core_ml.py')
    tf_model.write('scripts/convert_to_tfjs.py')
    tf_model.write('scripts/convert_to_tflite.py')
    tf_model.write('scripts/convert.py')
    tf_model.write('scripts/types.py')


def setup_object_detection():
  call(PULL_OBJECT_DETECTION, shell=True)
  setup(
    name='object_detection',
    version='0.1',
    include_package_data=True,
    packages=[p for p in find_packages() if p.startswith('object_detection')],
    description='Tensorflow Object Detection Library',
    cmdclass={
      args.type: InstallCommand,
    }
  )
  setup(
    name='slim',
    version='0.1',
    include_package_data=True,
    packages=[p for p in find_packages() if p.startswith('slim')],
    description='tf-slim',
    cmdclass={
      args.type: InstallCommand,
    }
  )
  shutil.rmtree('slim.egg-info')
  shutil.rmtree('object_detection.egg-info')


def setup_classification():
  call(PULL_CLASSIFICATION, shell=True)
  setup(
    name='classification',
    version='0.1',
    include_package_data=True,
    packages=[p for p in find_packages() if p.startswith('classification')],
    description='tf-classification',
    cmdclass={
      args.type: InstallCommand,
    }
  )
  shutil.rmtree('classification.egg-info')


def setup_all():
  setup_object_detection()
  setup_classification()


if args.type == 'all':
  setup_all()
  pack()


if args.type == 'object_detection':
  setup_object_detection()
  pack()
  

if args.type == 'classification':
  setup_classification()
  pack()
  

shutil.rmtree('dist')