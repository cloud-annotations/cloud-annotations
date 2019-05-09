const yaml = require('js-yaml')
const { dim } = require('chalk')
const CredentialsBuilder = require('./../utils/credentialsBuilder')
const fs = require('fs')

module.exports = (configPath = 'config.yaml') => {
  try {
    const config = yaml.safeLoad(fs.readFileSync(configPath))
    const credentials = new CredentialsBuilder({})
    config.credentials = credentials.credentials
    console.log(dim(`(Using settings from ${configPath})`))

    return config
  } catch {
    console.log(
      `No ${configPath} found, try running \`cacli init\` to generate one.`
    )
    return process.exit(1)
  }
}
