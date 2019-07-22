const fs = require('fs')
const request = require('request-promise-native')
const api = require('./api')
const safeGet = require('./../utils/safeGet')
const cosEndpointBuilder = require('./../utils/cosEndpointBuilder')
const { version } = require('./../../package.json')

const DEFAULT_GPU = 'k80'
const DEFAULT_STEPS = '500'
const DEFAULT_TRAINING_DEFINITION = {
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

class WML {
  constructor(config) {
    const { url, username, password } = config.credentials.wml
    const { cos } = config.credentials
    const { name, buckets, trainingParams } = config
    this._token = undefined
    this._url = url
    this._username = username
    this._password = password
    this._name = name
    this._buckets = buckets
    this._trainingParams = trainingParams
    this._cos = cos
  }

  async authenticate() {
    if (!this._token) {
      this._token = await api.authenticate(
        this._url,
        this._username,
        this._password
      )
    }
  }

  async startTraining(trainingScript) {
    const trainingDefinition = await this.createTrainingDefinition()
    await this.addTrainingScript(trainingDefinition, trainingScript)
    const trainingRun = await this.startTrainingRun(trainingDefinition)
    return trainingRun.metadata.guid
  }

  async createMonitorSocket(modelId) {
    await this.authenticate()
    return api.socket(this._url, this._token, modelId)
  }

  async getTrainingRun(modelId) {
    await this.authenticate()
    return api.getModel(this._url, this._token, modelId)
  }

  async listTrainingRuns() {
    await this.authenticate()
    return api.getModels(this._url, this._token)
  }

  async createTrainingDefinition() {
    await this.authenticate()
    // Deep copy.
    const trainingDefinition = JSON.parse(
      JSON.stringify(DEFAULT_TRAINING_DEFINITION)
    )
    trainingDefinition.name = this._name
    return api.postTrainingDefinition(
      this._url,
      this._token,
      trainingDefinition
    )
  }

  async addTrainingScript(trainingDefinition, trainingScript) {
    await this.authenticate()

    const trainingZip = (() => {
      if (trainingScript) {
        return fs.createReadStream(trainingScript)
      }
      return request(
        `https://github.com/cloud-annotations/training/releases/download/v${version}/training.zip`
      )
    })()

    return api.putTrainingDefinition(
      trainingDefinition.entity.training_definition_version.content_url,
      this._token,
      trainingZip
    )
  }

  async startTrainingRun(trainingDefinition) {
    await this.authenticate()

    const steps = safeGet(() => this._trainingParams.steps) || DEFAULT_STEPS
    const gpu = safeGet(() => this._trainingParams.gpu) || DEFAULT_GPU
    // Try to find the start command (could be `start.sh` or `zipname/start.sh`)
    const command = `cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && chmod 777 ./start.sh && ./start.sh ${steps}`
    const connection = {
      endpoint_url: cosEndpointBuilder(this._cos.region, false),
      access_key_id: this._cos.access_key_id,
      secret_access_key: this._cos.secret_access_key
    }
    const trainingRun = {
      model_definition: {
        framework: {
          name: trainingDefinition.entity.framework.name,
          version: trainingDefinition.entity.framework.version
        },
        name: this._name,
        author: {},
        definition_href: trainingDefinition.metadata.url,
        execution: {
          command: command,
          compute_configuration: { name: gpu }
        }
      },
      training_data_reference: {
        connection: connection,
        source: { bucket: this._buckets.training },
        type: 's3'
      },
      training_results_reference: {
        connection: connection,
        target: { bucket: this._buckets.output || this._buckets.training },
        type: 's3'
      }
    }
    return api.postModel(this._url, this._token, trainingRun)
  }
}

module.exports = WML
