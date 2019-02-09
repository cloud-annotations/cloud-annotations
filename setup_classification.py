"""Setup script for object_detection and slim"""

import tarfile
import zipfile
import shutil
import os

from setuptools import setup, find_packages

setup(
    name='classification',
    version='0.1',
    include_package_data=True,
    packages=[p for p in find_packages() if p.startswith('classification')],
    description='tf-classification',
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