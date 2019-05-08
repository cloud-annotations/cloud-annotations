const os = require('os')
const path = require('path')
const fs = require('fs-extra')
const safeGet = require('./../utils/safeGet')

const CREDENTIAL_PATH = path.join(os.homedir(), '.cacli', 'credentials')

const getItem = (string, profile, item) => {
  const r = new RegExp(`\\[${profile}\\]\\s(?:.*\\s){0,7}${item}: (.*?)\\s`, '')
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
          username: getItem(file, this.profile, 'username'),
          password: getItem(file, this.profile, 'password'),
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
          username: '',
          password: '',
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

  username() {
    return safeGet(() => this.credentials.wml.username)
  }

  password() {
    return safeGet(() => this.credentials.wml.password)
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

  setUsername(value) {
    this.credentials.wml.username = value
  }

  setPassword(value) {
    this.credentials.wml.password = value
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
username: ${this.credentials.wml.username}
password: ${this.credentials.wml.password}
url: ${this.credentials.wml.url}
access_key_id: ${this.credentials.cos.access_key_id}
secret_access_key: ${this.credentials.cos.secret_access_key}
region: ${this.credentials.cos.region}`
    fs.outputFileSync(CREDENTIAL_PATH, file)
  }
}
