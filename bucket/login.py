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
    RESOURCE_ID = input('Resource Instance ID: ')
    API_KEY = getpass.getpass(prompt='API Key: ')
else:
    RESOURCE_ID = input('Resource Instance ID: ')
    API_KEY = input('API Key: ')

CREDENTIALS = '.credentials'

with open(CREDENTIALS, 'w') as file:
    file.write('RESOURCE_INSTANCE_ID={}\n'.format(RESOURCE_ID))
    file.write('API_KEY={}\n'.format(API_KEY))

print("\033[92mSuccessfully set credentials!\033[0m")