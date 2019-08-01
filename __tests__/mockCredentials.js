const os = require('os')
const path = require('path')
const fs = require('fs-extra')

const CREDENTIAL_PATH = path.join(os.homedir(), '.cacli', 'credentials')

module.exports.CREDENTIAL_PATH = CREDENTIAL_PATH

module.exports.fill = () => {
  const file = `[default]
instance_id: 
api_key: api_key
url: url
access_key_id: access_key_id
secret_access_key: secret_access_key
region: us-geo`
  fs.outputFileSync(CREDENTIAL_PATH, file)
}

module.exports.noBuckets = () => {
  const file = `[default]
region: empty`
  fs.outputFileSync(CREDENTIAL_PATH, file)
}
