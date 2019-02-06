from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

if hasattr(__builtins__, 'raw_input'):
  input = raw_input

import fileinput
import getpass
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--hide', action='store_true')
args = parser.parse_args()

if args.hide:
  ML_USERNAME = getpass.getpass(prompt='ml_username: ')
  ML_PASSWORD = getpass.getpass(prompt='ml_password: ')
  ML_INSTANCE = getpass.getpass(prompt='ml_instance: ')
  ACCESS_KEY_ID = getpass.getpass(prompt='access_key_id: ')
  SECRET_ACCESS_KEY = getpass.getpass(prompt='secret_access_key: ')
else:
  ML_USERNAME = input('ml_username: ')
  ML_PASSWORD = input('ml_password: ')
  ML_INSTANCE = input('ml_instance: ')
  ACCESS_KEY_ID = input('access_key_id: ')
  SECRET_ACCESS_KEY = input('secret_access_key: ')

CREDENTIALS = '.credentials'

with open(CREDENTIALS, 'w') as file:
  file.write('ML_USERNAME={}\n'.format(ML_USERNAME))
  file.write('ML_PASSWORD={}\n'.format(ML_PASSWORD))
  file.write('ML_INSTANCE={}\n'.format(ML_INSTANCE))
  file.write('ACCESS_KEY_ID={}\n'.format(ACCESS_KEY_ID))
  file.write('SECRET_ACCESS_KEY={}\n'.format(SECRET_ACCESS_KEY))

print("\033[92mSuccessfully set credentials!\033[0m")