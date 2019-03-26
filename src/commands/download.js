const fs = require('fs-extra')
const loadConfig = require('./../utils/loadConfig')
const optionsParse = require('./../utils/optionsParse')
const cosEndpointBuilder = require('./../utils/cosEndpointBuilder')
const WML = require('./../api/wml')
const COS = require('ibm-cos-sdk')

module.exports = async options => {
  const parser = optionsParse()
  parser.add('model_id')
  parser.add([true, 'help', '--help', '-h'])
  const ops = parser.parse(options)

  if (ops.help) {
    console.log('cacli download <model_id>')
    process.exit()
  }

  const config = loadConfig()

  if (!ops.model_id) {
    console.log('No Model ID provided')
    console.log('Usage: cacli download <model_id>')
    process.exit(1)
  }

  const run = await new WML(config).getTrainingRun(ops.model_id)

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
  const cos = new COS.S3(cosConfig)

  const ios = await cos
    .listObjectsV2({ Bucket: bucket, Prefix: `${model_location}/model_ios` })
    .promise()
    .then(data =>
      data.Contents.map(o => o.Key).filter(name => !name.endsWith('/'))
    )
  const web = await cos
    .listObjectsV2({ Bucket: bucket, Prefix: `${model_location}/model_web` })
    .promise()
    .then(data =>
      data.Contents.map(o => o.Key).filter(name => !name.endsWith('/'))
    )
  const android = await cos
    .listObjectsV2({
      Bucket: bucket,
      Prefix: `${model_location}/model_android`
    })
    .promise()
    .then(data =>
      data.Contents.map(o => o.Key).filter(name => !name.endsWith('/'))
    )

  ios.forEach(file => {
    const outputPath = './' + file.replace(`${model_location}/`, '')
    cos
      .getObject({
        Bucket: bucket,
        Key: file
      })
      .promise()
      .then(data => {
        fs.outputFile(outputPath, data.Body)
      })
  })

  web.forEach(file => {
    const outputPath = './' + file.replace(`${model_location}/`, '')
    cos
      .getObject({
        Bucket: bucket,
        Key: file
      })
      .promise()
      .then(data => {
        fs.outputFile(outputPath, data.Body)
      })
  })

  android.forEach(file => {
    const outputPath = './' + file.replace(`${model_location}/`, '')
    cos
      .getObject({
        Bucket: bucket,
        Key: file
      })
      .promise()
      .then(data => {
        fs.outputFile(outputPath, data.Body)
      })
  })
}
