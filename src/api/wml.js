const request = require('request-promise-native')
const WebSocket = require('ws')
const safeGet = require('./../utils/safeGet')
const cosEndpointBuilder = require('./../utils/cosEndpointBuilder')
const { version } = require('./../../package.json')
const fs = require('fs')

const DEFAULT_GPU = 'k80'
const DEFAULT_STEPS = '500'

class WML {
  constructor(config) {
    this._token = undefined
    this._config = config
  }

  static trainingRunBuilder(config) {
    return new WML(config)
  }

  async startTraining(trainingScript) {
    const trainingDefinition = await this.createTrainingDefinition()
    await this.addTrainingScript(trainingDefinition, trainingScript)
    const trainingRun = await this.startTrainingRun(trainingDefinition)
    return trainingRun.metadata.guid
  }

  // Deprecated.
  async start() {
    const trainingDefinition = await this.createTrainingDefinition()
    await this.addTrainingScript(trainingDefinition)
    const trainingRun = await this.startTrainingRun(trainingDefinition)
    return trainingRun.metadata.guid
  }

  async authenticate() {
    return request({
      method: 'GET',
      json: true,
      url: `${this._config.credentials.wml.url}/v3/identity/token`,
      auth: {
        user: this._config.credentials.wml.username,
        pass: this._config.credentials.wml.password
      }
    }).then(body => {
      return body.token
    })
  }

  async createMonitorSocket(model_id) {
    if (!this._token) {
      this._token = await this.authenticate()
    }
    const url =
      this._config.credentials.wml.url.replace('https', 'wss') +
      '/v3/models/' +
      model_id +
      '/monitor'
    return new WebSocket(url, {
      headers: {
        Authorization: `bearer ${this._token}`
      }
    })
  }

  async getTrainingRun(model_id) {
    if (!this._token) {
      this._token = await this.authenticate()
    }
    return request({
      method: 'get',
      json: true,
      url: `${this._config.credentials.wml.url}/v3/models/${model_id}`,
      auth: {
        bearer: this._token
      }
    })
  }

  async listTrainingRuns() {
    if (!this._token) {
      this._token = await this.authenticate()
    }
    return request({
      method: 'get',
      json: true,
      url: `${this._config.credentials.wml.url}/v3/models`,
      auth: {
        bearer: this._token
      }
    })
  }

  async createTrainingDefinition() {
    if (!this._token) {
      this._token = await this.authenticate()
    }
    const trainingDefinition = {
      name: this._config.name,
      framework: {
        name: 'tensorflow',
        version: '1.12',
        runtimes: [
          {
            name: 'python',
            version: '3.6'
          }
        ]
      }
    }
    return request({
      method: 'POST',
      json: true,
      url: `${
        this._config.credentials.wml.url
      }/v3/ml_assets/training_definitions`,
      auth: {
        bearer: this._token
      },
      body: trainingDefinition
    })
  }

  async addTrainingScript(trainingDefinition, trainingScript) {
    if (!this._token) {
      this._token = await this.authenticate()
    }

    const trainingZip = (() => {
      if (trainingScript) {
        return fs.createReadStream(trainingScript)
      }
      return request(
        `https://github.com/cloud-annotations/training/releases/download/v${version}/training.zip`
      )
    })()

    return trainingZip.pipe(
      request({
        method: 'PUT',
        json: true,
        url: trainingDefinition.entity.training_definition_version.content_url,
        auth: {
          bearer: this._token
        },
        headers: {
          'content-type': 'application/octet-stream'
        }
      })
    )
  }

  async startTrainingRun(trainingDefinition) {
    if (!this._token) {
      this._token = await this.authenticate()
    }

    const steps =
      safeGet(() => this._config.trainingParams.steps) || DEFAULT_STEPS
    // Try to find the start command (could be `start.sh` or `zipname/start.sh`)
    const command = `cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && ./start.sh ${steps}`
    const connection = {
      endpoint_url: cosEndpointBuilder(
        this._config.credentials.cos.region,
        false
      ),
      access_key_id: this._config.credentials.cos.access_key_id,
      secret_access_key: this._config.credentials.cos.secret_access_key
    }
    const trainingRun = {
      model_definition: {
        framework: {
          name: trainingDefinition.entity.framework.name,
          version: trainingDefinition.entity.framework.version
        },
        name: this._config.name,
        author: {},
        definition_href: trainingDefinition.metadata.url,
        execution: {
          command: command,
          compute_configuration: {
            name:
              safeGet(() => this._config.trainingParams.gpu, DEFAULT_GPU) ||
              DEFAULT_GPU
          }
        }
      },
      training_data_reference: {
        connection: connection,
        source: { bucket: this._config.buckets.training },
        type: 's3'
      },
      training_results_reference: {
        connection: connection,
        target: {
          bucket: this._config.buckets.output || this._config.buckets.training
        },
        type: 's3'
      }
    }
    return request({
      method: 'POST',
      json: true,
      url: `${this._config.credentials.wml.url}/v3/models`,
      auth: {
        bearer: this._token
      },
      body: trainingRun
    })
  }
}

module.exports = WML
