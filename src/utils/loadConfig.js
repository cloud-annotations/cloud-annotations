const yaml = require('js-yaml')
const { dim } = require('chalk')
const fs = require('fs')

module.exports = () => {
  try {
    const config = yaml.safeLoad(fs.readFileSync('config.yaml'))
    console.log(dim('(Using settings from config.yaml)'))
    return config
  } catch {
    console.log(
      'No config.yaml found, try running `cacli init` to generate one.'
    )
    process.exit(1)
  }
}
