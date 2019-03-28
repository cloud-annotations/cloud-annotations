const yaml = require('js-yaml')
const { dim } = require('chalk')
const fs = require('fs')

module.exports = (configPath = 'config.yaml') => {
  try {
    const config = yaml.safeLoad(fs.readFileSync(configPath))
    console.log(dim(`(Using settings from ${configPath})`))
    return config
  } catch {
    console.log(
      `No ${configPath} found, try running \`cacli init\` to generate one.`
    )
    process.exit(1)
  }
}
