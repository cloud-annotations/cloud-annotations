const { dim, bold, red, green } = require('chalk')
const yaml = require('js-yaml')
const COS = require('ibm-cos-sdk')
const fs = require('fs')
const WML = require('./../api/wml')
const progress = require('./../commands/progress')
const init = require('./../commands/init')
const input = require('./../utils/input')
const stringLength = require('./../utils/stringLength')
const stringToBool = require('./../utils/stringToBool')
const optionsParse = require('./../utils/optionsParse')
const ConfigBuilder = require('./../utils/configBuilder')
const CredentialsBuilder = require('./../utils/credentialsBuilder')
const cosEndpointBuilder = require('./../utils/cosEndpointBuilder')
const Spinner = require('./../utils/spinner')

const validateConfig = async config => {
  const spinner = new Spinner()
  spinner.setMessage('Validating config...')
  spinner.start()

  let errors = false
  try {
    await new WML(config).authenticate()
  } catch {
    spinner.stop()
    console.error(
      `${red('error')} Invalid Watson Machine Learning credentials.`
    )
    errors = true
  }

  try {
    const { region, access_key_id, secret_access_key } = config.credentials.cos
    const cosConfig = {
      endpoint: cosEndpointBuilder(region, true),
      accessKeyId: access_key_id,
      secretAccessKey: secret_access_key
    }
    const cos = new COS.S3(cosConfig)

    await cos
      .listBuckets()
      .promise()
      .then(data =>
        data.Buckets.map(bucket => {
          return bucket.Name
        })
      )
    try {
      // We must have a training bucket, so always check.
      await cos
        .getBucketLocation({ Bucket: config.buckets.training })
        .promise()
        .then(data => data.LocationConstraint)
    } catch {
      spinner.stop()
      console.error(`${red('error')} Invalid training bucket.`)
      errors = true
    }

    try {
      // We don't need an output bucket, so only check if one was provided.
      if (config.buckets.output) {
        await cos
          .getBucketLocation({ Bucket: config.buckets.output })
          .promise()
          .then(data => data.LocationConstraint)
      }
    } catch {
      spinner.stop()
      console.error(`${red('error')} Invalid output bucket.`)
      errors = true
    }
  } catch {
    spinner.stop()
    console.error(`${red('error')} Invalid Cloud Object Storage credentials.`)
    errors = true
  }

  if (errors) {
    throw Error()
  }
  spinner.stop()
}

module.exports = async options => {
  const parser = optionsParse()
  parser.add('training_zip')
  parser.add(['--config', '-c'])
  parser.add([true, 'help', '--help', '-help', '-h'])
  const ops = parser.parse(options)

  if (ops.help) {
    console.log('cacli train [<zip_file>]')
    return process.exit()
  }

  const configPath = ops.config || 'config.yaml'

  const config = await (async () => {
    try {
      const config = new ConfigBuilder(ops.config).config
      yaml.safeLoad(fs.readFileSync(configPath)) // force a crash.
      console.log(dim(`(Using settings from ${configPath})`))
      return config
    } catch {
      console.log(
        `No ${configPath} found, we will only ask the required information.`
      )
      console.log()
      const config = await init(['--config', configPath], true)
      return config
    }
  })()

  const credentials = new CredentialsBuilder({})

  config.credentials = credentials.credentials

  try {
    await validateConfig(config)
  } catch {
    return process.exit(1)
  }

  const spinner = new Spinner()
  spinner.setMessage('Starting training run...')
  spinner.start()
  const wml = new WML(config)
  const modelId = await wml.startTraining(ops.training_zip)
  spinner.stop()
  console.log(`${green('success')} Training run submitted.`)
  console.log()

  console.log('Model ID:')
  console.log(`┌─${'─'.repeat(stringLength(modelId))}─┐`)
  console.log(`│ ${bold.cyan(modelId)} │`)
  console.log(`└─${'─'.repeat(stringLength(modelId))}─┘`)
  console.log()

  const shouldMonitor = stringToBool(
    await input(`Would you like to monitor progress? `, 'yes')
  )

  if (shouldMonitor) {
    console.log()
    await progress([modelId], config)
  }
}
