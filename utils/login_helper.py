from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import fileinput
import getpass
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--hide', action='store_true')
args = parser.parse_args()

class LoginHelper:
  def __init__(self, file_name):
    self.f = open(file_name, 'w')

  def __enter__(self):
    return self

  def __exit__(self, type, value, traceback):
    self.f.close()
    if not value:
      print('\033[92mSuccessfully set credentials!\033[0m')

  def prompt(self, credential, secret=None):
    message = '{}: '.format(credential)
    if secret and args.hide:
      value = getpass.getpass(prompt=message)
    else:
      try:
        _ = raw_input
        value = raw_input(message)
      except NameError:
        value = input(message)
    
    self.f.write('{}={}\n'.format(credential.upper().replace(' ', '_'), value))