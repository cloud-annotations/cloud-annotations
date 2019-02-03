"""Setup script for object_detection and slim"""

from setuptools import setup, find_packages
import tarfile
import zipfile
import shutil
import os

REQUIRED_PACKAGES = ['Pillow>=1.0', 'Matplotlib>=2.1', 'Cython>=0.28.1']

setup(
    name='object_detection',
    version='0.1',
    install_requires=REQUIRED_PACKAGES,
    include_package_data=True,
    packages=[p for p in find_packages() if p.startswith('object_detection')],
    description='Tensorflow Object Detection Library',
)

setup(
    name='slim',
    version='0.1',
    include_package_data=True,
    packages=[p for p in find_packages() if p.startswith('slim')],
    description='tf-slim',
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
  tf_model.write('bucket/prepare_data.py')
  tf_model.write('bucket/pipeline_skeleton.config')
  tf_model.write('quick_export_graph.py')

shutil.rmtree('dist')