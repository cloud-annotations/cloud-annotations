const yaml = require('js-yaml')
const fs = require('fs-extra')
const safeGet = require('./../utils/safeGet')

module.exports = class ConfigBuilder {
  constructor(configPath) {
    this.configPath = configPath || 'config.yaml'
    const rawConfig = (() => {
      try {
        return yaml.safeLoad(fs.readFileSync(this.configPath))
      } catch {
        return null
      }
    })()

    this.config = {}

    const name = safeGet(() => rawConfig.name)
    if (name) {
      this.config.name = name
    }

    const trainingBucket = safeGet(() => rawConfig.buckets.training)
    const outputBucket = safeGet(() => rawConfig.buckets.output)

    // buckets should always be there with an empty training bucket.
    this.config.buckets = {}
    this.config.buckets.training = ''
    if (trainingBucket) {
      this.config.buckets.training = trainingBucket
    }
    if (outputBucket) {
      this.config.buckets.output = outputBucket
    }

    const gpu = safeGet(() => rawConfig.trainingParams.gpu)
    const steps = safeGet(() => rawConfig.trainingParams.steps)
    if (gpu || steps) {
      this.config.trainingParams = {}
      if (gpu) {
        this.config.trainingParams.gpu = gpu
      }
      if (steps) {
        this.config.trainingParams.steps = steps
      }
    }
  }

  name() {
    return safeGet(() => this.config.name)
  }

  trainingBucket() {
    return safeGet(() => this.config.buckets.training)
  }

  outputBucket() {
    return safeGet(() => this.config.buckets.output)
  }

  gpu() {
    return safeGet(() => this.config.trainingParams.gpu)
  }

  steps() {
    return safeGet(() => this.config.trainingParams.steps)
  }

  _ensureKey(key) {
    if (this.config[key] === undefined) {
      this.config[key] = {}
    }
  }

  setName(name) {
    this.config.name = name
  }

  setTrainingBucket(name) {
    this._ensureKey('buckets')
    this.config.buckets.training = name
  }

  setOutputBucket(name) {
    this._ensureKey('buckets')
    this.config.buckets.output = name
  }

  setGPU(gpu) {
    this._ensureKey('trainingParams')
    this.config.trainingParams.gpu = gpu
  }

  setSteps(steps) {
    this._ensureKey('trainingParams')
    this.config.trainingParams.steps = steps
  }

  getYaml() {
    console.log(this.config)
    return yaml.safeDump(this.config)
  }

  outputFile() {
    fs.outputFileSync(this.configPath, this.getYaml())
  }
}
