const { spawn } = require('child_process')

const WML = require('./../api/wml')
const loadCredentials = require('./../utils/loadCredentials')
const optionsParse = require('./../utils/optionsParse')
const cosEndpointBuilder = require('./../utils/cosEndpointBuilder')

module.exports = async options => {
  const parser = optionsParse()
  parser.add('model_id')
  parser.add(['--config', '-c'])
  parser.add([true, 'help', '--help', '-help', '-h'])
  const ops = parser.parse(options)

  if (ops.help) {
    console.log('cacli tensorboard <model_id>')
    return process.exit()
  }

  if (!ops.model_id) {
    console.log('No Model ID provided')
    console.log('Usage: cacli tensorboard <model_id>')
    return process.exit(1)
  }

  const config = await loadCredentials()

  const wml = new WML(config)

  const run = await wml.getTrainingRun(ops.model_id)

  const {
    bucket,
    model_location
  } = run.entity.training_results_reference.location

  const { region, access_key_id, secret_access_key } = config.credentials.cos

  const cosConfig = {
    endpoint: cosEndpointBuilder(region, true),
    accessKeyId: access_key_id,
    secretAccessKey: secret_access_key
  }

  const tensorboard = spawn(
    'tensorboard',
    [`--logdir=s3://${bucket}/${model_location}`],
    {
      env: {
        ...process.env,
        AWS_ACCESS_KEY_ID: cosConfig.accessKeyId,
        AWS_SECRET_ACCESS_KEY: cosConfig.secretAccessKey,
        S3_ENDPOINT: cosConfig.endpoint.replace(/^(https:\/\/)/, '')
      }
    }
  )

  tensorboard.stderr.on('data', data => {
    console.log(data.toString())
  })
}
