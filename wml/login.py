from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

from utils.login_helper import LoginHelper

with LoginHelper('.credentials_wml') as login:
  print('- Watson Machine Learning -')
  login.prompt('ml_username', secret=True)
  login.prompt('ml_password', secret=True)
  login.prompt('ml_instance', secret=True)
  print('\n- Cloud Object Storage -')
  login.prompt('access_key_id', secret=True)
  login.prompt('secret_access_key', secret=True)