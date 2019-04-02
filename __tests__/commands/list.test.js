const assert = require('assert')
const sinon = require('sinon')
const list = require('./../../src/commands/list')
const api = require('./../../src/api/api')

describe('list', () => {
  const completed = {
    metadata: {
      guid: 'model-1g47xe42',
      url: '/v3/models/model-1g47xe42',
      created_at: '2019-03-27T00:11:19.433Z',
      modified_at: '2019-03-27T00:11:19.433Z'
    },
    entity: {
      model_definition: {
        framework: { name: 'tensorflow', version: '1.12' },
        name: 'pepsi-coke-mountain-dew',
        definition_href:
          'https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/bdcdee9d-79cf-40bb-a81a-92891998e91b',
        execution: {
          command:
            'eval "$(find . -name "start.sh" -maxdepth 2 -print -quit)" 500',
          compute_configuration: { name: 'k80' }
        }
      },
      training_data_reference: {
        type: 's3',
        connection: {
          endpoint_url:
            'https://s3-api.us-geo.objectstorage.service.networklayer.com',
          access_key_id: 'a9348731fad64e87b50ff544297e68af',
          secret_access_key: 'fab1c3a07286c1682de6f9de1e8f88ebbf443f01077e38d9'
        },
        location: { bucket: 'pepsi-coke-mountain-dew' }
      },
      training_results_reference: {
        type: 's3',
        connection: {
          endpoint_url:
            'https://s3-api.us-geo.objectstorage.service.networklayer.com',
          access_key_id: 'a9348731fad64e87b50ff544297e68af',
          secret_access_key: 'fab1c3a07286c1682de6f9de1e8f88ebbf443f01077e38d9'
        },
        location: {
          bucket: 'soda-output-dir',
          model_location: 'training-ezakgkemg'
        }
      },
      status: {
        state: 'completed',
        finished_at: '2019-03-27T00:14:36.386Z',
        submitted_at: '2019-03-27T00:11:29.351Z',
        running_at: '2019-03-27T00:12:33.781Z',
        error: {
          trace: '',
          errors: [
            {
              code: 'dl_job_failed (C201)',
              message:
                'Learner process crashed (C201) with exit code (1), please check the job logs for more information',
              more_info: 'http://watson-ml-api.mybluemix.net/'
            }
          ]
        },
        message: 'training-ezakgkemg: 1',
        metrics: [],
        current_at: '2019-03-27T00:15:41.174Z',
        error_cause: 'user'
      }
    }
  }
  const error = {
    metadata: {
      guid: 'model-1g47xe42',
      url: '/v3/models/model-1g47xe42',
      created_at: '2019-03-27T00:11:19.433Z',
      modified_at: '2019-03-27T00:11:19.433Z'
    },
    entity: {
      model_definition: {
        framework: { name: 'tensorflow', version: '1.12' },
        name: 'pepsi-coke-mountain-dew',
        definition_href:
          'https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/bdcdee9d-79cf-40bb-a81a-92891998e91b',
        execution: {
          command:
            'eval "$(find . -name "start.sh" -maxdepth 2 -print -quit)" 500',
          compute_configuration: { name: 'k80' }
        }
      },
      training_data_reference: {
        type: 's3',
        connection: {
          endpoint_url:
            'https://s3-api.us-geo.objectstorage.service.networklayer.com',
          access_key_id: 'a9348731fad64e87b50ff544297e68af',
          secret_access_key: 'fab1c3a07286c1682de6f9de1e8f88ebbf443f01077e38d9'
        },
        location: { bucket: 'pepsi-coke-mountain-dew' }
      },
      training_results_reference: {
        type: 's3',
        connection: {
          endpoint_url:
            'https://s3-api.us-geo.objectstorage.service.networklayer.com',
          access_key_id: 'a9348731fad64e87b50ff544297e68af',
          secret_access_key: 'fab1c3a07286c1682de6f9de1e8f88ebbf443f01077e38d9'
        },
        location: {
          bucket: 'soda-output-dir',
          model_location: 'training-ezakgkemg'
        }
      },
      status: {
        state: 'error',
        finished_at: '2019-03-27T00:14:36.386Z',
        submitted_at: '2019-03-27T00:11:29.351Z',
        running_at: '2019-03-27T00:12:33.781Z',
        error: {
          trace: '',
          errors: [
            {
              code: 'dl_job_failed (C201)',
              message:
                'Learner process crashed (C201) with exit code (1), please check the job logs for more information',
              more_info: 'http://watson-ml-api.mybluemix.net/'
            }
          ]
        },
        message: 'training-ezakgkemg: 1',
        metrics: [],
        current_at: '2019-03-27T00:15:41.174Z',
        error_cause: 'user'
      }
    }
  }
  const canceled = {
    metadata: {
      guid: 'model-1g47xe42',
      url: '/v3/models/model-1g47xe42',
      created_at: '2019-03-27T00:11:19.433Z',
      modified_at: '2019-03-27T00:11:19.433Z'
    },
    entity: {
      model_definition: {
        framework: { name: 'tensorflow', version: '1.12' },
        name: 'pepsi-coke-mountain-dew',
        definition_href:
          'https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/bdcdee9d-79cf-40bb-a81a-92891998e91b',
        execution: {
          command:
            'eval "$(find . -name "start.sh" -maxdepth 2 -print -quit)" 500',
          compute_configuration: { name: 'k80' }
        }
      },
      training_data_reference: {
        type: 's3',
        connection: {
          endpoint_url:
            'https://s3-api.us-geo.objectstorage.service.networklayer.com',
          access_key_id: 'a9348731fad64e87b50ff544297e68af',
          secret_access_key: 'fab1c3a07286c1682de6f9de1e8f88ebbf443f01077e38d9'
        },
        location: { bucket: 'pepsi-coke-mountain-dew' }
      },
      training_results_reference: {
        type: 's3',
        connection: {
          endpoint_url:
            'https://s3-api.us-geo.objectstorage.service.networklayer.com',
          access_key_id: 'a9348731fad64e87b50ff544297e68af',
          secret_access_key: 'fab1c3a07286c1682de6f9de1e8f88ebbf443f01077e38d9'
        },
        location: {
          bucket: 'soda-output-dir',
          model_location: 'training-ezakgkemg'
        }
      },
      status: {
        state: 'canceled',
        finished_at: '2019-03-27T00:14:36.386Z',
        submitted_at: '2019-03-27T00:11:29.351Z',
        running_at: '2019-03-27T00:12:33.781Z',
        error: {
          trace: '',
          errors: [
            {
              code: 'dl_job_failed (C201)',
              message:
                'Learner process crashed (C201) with exit code (1), please check the job logs for more information',
              more_info: 'http://watson-ml-api.mybluemix.net/'
            }
          ]
        },
        message: 'training-ezakgkemg: 1',
        metrics: [],
        current_at: '2019-03-27T00:15:41.174Z',
        error_cause: 'user'
      }
    }
  }
  const running = {
    metadata: {
      guid: 'model-1g47xe42',
      url: '/v3/models/model-1g47xe42',
      created_at: '2019-03-27T00:11:19.433Z',
      modified_at: '2019-03-27T00:11:19.433Z'
    },
    entity: {
      model_definition: {
        framework: { name: 'tensorflow', version: '1.12' },
        name: 'pepsi-coke-mountain-dew',
        definition_href:
          'https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/bdcdee9d-79cf-40bb-a81a-92891998e91b',
        execution: {
          command:
            'eval "$(find . -name "start.sh" -maxdepth 2 -print -quit)" 500',
          compute_configuration: { name: 'k80' }
        }
      },
      training_data_reference: {
        type: 's3',
        connection: {
          endpoint_url:
            'https://s3-api.us-geo.objectstorage.service.networklayer.com',
          access_key_id: 'a9348731fad64e87b50ff544297e68af',
          secret_access_key: 'fab1c3a07286c1682de6f9de1e8f88ebbf443f01077e38d9'
        },
        location: { bucket: 'pepsi-coke-mountain-dew' }
      },
      training_results_reference: {
        type: 's3',
        connection: {
          endpoint_url:
            'https://s3-api.us-geo.objectstorage.service.networklayer.com',
          access_key_id: 'a9348731fad64e87b50ff544297e68af',
          secret_access_key: 'fab1c3a07286c1682de6f9de1e8f88ebbf443f01077e38d9'
        },
        location: {
          bucket: 'soda-output-dir',
          model_location: 'training-ezakgkemg'
        }
      },
      status: {
        state: 'running',
        finished_at: '2019-03-27T00:14:36.386Z',
        submitted_at: '2019-03-27T00:11:29.351Z',
        running_at: '2019-03-27T00:12:33.781Z',
        error: {
          trace: '',
          errors: [
            {
              code: 'dl_job_failed (C201)',
              message:
                'Learner process crashed (C201) with exit code (1), please check the job logs for more information',
              more_info: 'http://watson-ml-api.mybluemix.net/'
            }
          ]
        },
        message: 'training-ezakgkemg: 1',
        metrics: [],
        current_at: '2019-03-27T00:15:41.174Z',
        error_cause: 'user'
      }
    }
  }

  const models = {
    resources: [completed, error, canceled, running]
  }
  it('dry run', async () => {
    sinon.stub(api, 'getModels').returns(models)
    sinon.stub(api, 'authenticate').returns('fake_token')
    await list(['--config', '__tests__/config.yaml'])
    api.getModels.restore()
    api.authenticate.restore()
  })

  it('displays help', async () => {
    sinon.stub(process, 'exit')
    await list(['--help'])
    process.exit.restore()
  })
})
