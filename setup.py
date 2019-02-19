"""Setup script"""

import tarfile
import zipfile
import shutil
import argparse
import os

from setuptools import setup, find_packages
from setuptools.command.sdist import sdist
from subprocess import call

class InstallCommand(sdist):
  def initialize_options(self):
    sdist.initialize_options(self)
    self.custom_option = None

  def finalize_options(self):
    sdist.finalize_options(self)

  def run(self):
    sdist.run(self)

parser = argparse.ArgumentParser()
parser.add_argument('type')
args = parser.parse_args()

if args.type == 'object_detection':
  command = """
    svn export -r 8436 https://github.com/tensorflow/models/trunk/research/object_detection &&
    svn export -r 8436 https://github.com/tensorflow/models/trunk/research/slim &&
    protoc object_detection/protos/*.proto --python_out=.
  """
  call(command, shell=True)
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

  with zipfile.ZipFile('tf-model.zip', 'w', zipfile.ZIP_DEFLATED) as tf_model:
    with tarfile.open('dist/slim-0.1.tar.gz') as slim_tar:
        for member in slim_tar.getmembers():
          if member.name.startswith('slim-0.1/slim/'):
            if member.isfile():
              print('in: {}'.format(member.name))
              f = slim_tar.extractfile(member)
              rel_path = os.path.relpath(member.name, 'slim-0.1')
              tf_model.writestr(rel_path, f.read())
    with tarfile.open('dist/object_detection-0.1.tar.gz') as object_detection_tar:
      for member in object_detection_tar.getmembers():
        if member.name.startswith('object_detection-0.1/object_detection/'):
          if member.isfile():
            print('in: {}'.format(member.name))
            f = object_detection_tar.extractfile(member)
            rel_path = os.path.relpath(member.name, 'object_detection-0.1')
            tf_model.writestr(rel_path, f.read())
    tf_model.write('bucket/__init__.py')
    tf_model.write('bucket/prepare_data_object_detection.py')
    tf_model.write('bucket/pipeline_skeleton.config')
    tf_model.write('scripts/__init__.py')
    tf_model.write('scripts/quick_export_graph.py')
    tf_model.write('wml/__init__.py')
    tf_model.write('wml/train_command.py')


if args.type == 'classification':
  command = """
    svn export -r 308 https://github.com/tensorflow/hub/trunk/examples/image_retraining classification
    echo > classification/__init__.py
  """
  call(command, shell=True)
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

  with zipfile.ZipFile('tf-model.zip', 'w', zipfile.ZIP_DEFLATED) as tf_model:
    with tarfile.open('dist/classification-0.1.tar.gz') as classification_tar:
        for member in classification_tar.getmembers():
          if member.name.startswith('classification-0.1/classification/'):
            if member.isfile():
              print('in: {}'.format(member.name))
              f = classification_tar.extractfile(member)
              rel_path = os.path.relpath(member.name, 'classification-0.1')
              tf_model.writestr(rel_path, f.read())
    tf_model.write('bucket/__init__.py')
    tf_model.write('bucket/prepare_data_classification.py')
    tf_model.write('wml/__init__.py')
    tf_model.write('wml/train_command.py')

shutil.rmtree('dist')