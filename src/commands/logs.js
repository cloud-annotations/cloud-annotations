const WML = require('./../api/wml')
const loadConfig = require('./../utils/loadConfig')
const optionsParse = require('./../utils/optionsParse')
const cosEndpointBuilder = require('./../utils/cosEndpointBuilder')
const COS = require('ibm-cos-sdk')

module.exports = async options => {
  const parser = optionsParse()
  parser.add('model_id')
  parser.add([true, 'help', '--help', '-h'])
  const ops = parser.parse(options)

  if (ops.help) {
    console.log('cacli logs <model_id>')
    process.exit()
  }

  const config = loadConfig()

  if (!ops.model_id) {
    console.log('No Model ID provided')
    console.log('Usage: cacli logs <model_id>')
    process.exit(1)
  }

  const wml = new WML(config)

  const run = await wml.getTrainingRun(ops.model_id)
  const status = run.entity.status.state
  switch (status) {
    case 'completed':
    case 'error':
    case 'failed':
    case 'canceled':
      console.log()
      console.log(`────────────${'─'.repeat(ops.model_id.length)}────────`)
      console.log()
      console.log(`   Monitoring ${ops.model_id}...`)
      console.log()
      console.log(`────────────${'─'.repeat(ops.model_id.length)}────────`)
      console.log()
      const {
        bucket,
        model_location
      } = run.entity.training_results_reference.location

      const {
        region,
        access_key_id,
        secret_access_key
      } = config.credentials.cos
      const cosConfig = {
        endpoint: cosEndpointBuilder(region, true),
        accessKeyId: access_key_id,
        secretAccessKey: secret_access_key
      }
      const cos = new COS.S3(cosConfig)
      cos
        .getObject({
          Bucket: bucket,
          Key: `${model_location}/learner-1/training-log.txt`
        })
        .promise()
        .then(data => {
          console.log(data.Body.toString('utf8'))
          console.log()
          console.log(`───────────────────────`)
          console.log()
          console.log('   Log monitor done.')
          console.log()
          console.log(`───────────────────────`)
          console.log()
        })
      return
  }

  const ws = await wml.createMonitorSocket(ops.model_id)
  ws.on('open', function open() {
    console.log()
    console.log(`────────────${'─'.repeat(ops.model_id.length)}────────`)
    console.log()
    console.log(`   Monitoring ${ops.model_id}...`)
    console.log()
    console.log(`────────────${'─'.repeat(ops.model_id.length)}────────`)
    console.log()
  })

  ws.on('close', function close() {
    console.log()
    console.log(`───────────────────────`)
    console.log()
    console.log('   Log monitor done.')
    console.log()
    console.log(`───────────────────────`)
    console.log()
  })

  ws.on('message', function message(message) {
    const { status } = JSON.parse(message)
    if (status) {
      const { message } = status
      if (message) {
        if (message.length > 0) {
          console.log(message)
        }
      }
    }
  })
}
