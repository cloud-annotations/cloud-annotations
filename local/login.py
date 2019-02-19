from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

from utils.login_helper import LoginHelper

with LoginHelper('.credentials') as login:
  print('- Cloud Object Storage -')
  login.prompt('Resource Instance ID')
  login.prompt('API Key', secret=True)