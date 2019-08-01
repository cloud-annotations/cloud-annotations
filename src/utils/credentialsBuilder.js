const os = require('os')
const path = require('path')
const fs = require('fs-extra')
const safeGet = require('./../utils/safeGet')

const CREDENTIAL_PATH = path.join(os.homedir(), '.cacli', 'credentials')

const getItem = (string, profile, item) => {
  const r = new RegExp(
    `\\[${profile}\\]\\s(?:.*\\s){0,7}${item}: (.*?)(?:\\s|$)`,
    ''
  )
  try {
    return r.exec(string)[1]
  } catch {
    return ''
  }
}

module.exports = class CredentialsBuilder {
  constructor({ profile = 'default' }) {
    this.profile = profile
    try {
      const file = fs.readFileSync(CREDENTIAL_PATH, 'utf8')
      this.credentials = {
        wml: {
          instance_id: getItem(file, this.profile, 'instance_id'),
          api_key: getItem(file, this.profile, 'api_key'),
          url: getItem(file, this.profile, 'url')
        },
        cos: {
          access_key_id: getItem(file, this.profile, 'access_key_id'),
          secret_access_key: getItem(file, this.profile, 'secret_access_key'),
          region: getItem(file, this.profile, 'region')
        }
      }
    } catch {
      this.credentials = {
        wml: {
          instance_id: '',
          api_key: '',
          url: ''
        },
        cos: {
          access_key_id: '',
          secret_access_key: '',
          region: ''
        }
      }
    }
  }

  instanceId() {
    return safeGet(() => this.credentials.wml.instance_id)
  }

  apiKey() {
    return safeGet(() => this.credentials.wml.api_key)
  }

  url() {
    return safeGet(() => this.credentials.wml.url)
  }

  accessKey() {
    return safeGet(() => this.credentials.cos.access_key_id)
  }

  secret() {
    return safeGet(() => this.credentials.cos.secret_access_key)
  }

  region() {
    return safeGet(() => this.credentials.cos.region)
  }

  setInstanceId(value) {
    this.credentials.wml.instance_id = value
  }

  setApiKey(value) {
    this.credentials.wml.api_key = value
  }

  setUrl(value) {
    this.credentials.wml.url = value
  }

  setAccessKey(value) {
    this.credentials.cos.access_key_id = value
  }

  setSecret(value) {
    this.credentials.cos.secret_access_key = value
  }

  setRegion(value) {
    this.credentials.cos.region = value
  }

  outputFile() {
    const file = `[${this.profile}]
instance_id: ${this.credentials.wml.instance_id}
api_key: ${this.credentials.wml.api_key}
url: ${this.credentials.wml.url}
access_key_id: ${this.credentials.cos.access_key_id}
secret_access_key: ${this.credentials.cos.secret_access_key}
region: ${this.credentials.cos.region}`
    fs.outputFileSync(CREDENTIAL_PATH, file)
  }
}
