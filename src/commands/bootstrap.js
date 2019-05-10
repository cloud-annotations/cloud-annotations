const { green } = require('chalk')
const loadCredentials = require('./../utils/loadCredentials')
const COS = require('ibm-cos-sdk')
const optionsParse = require('./../utils/optionsParse')
const cosEndpointBuilder = require('./../utils/cosEndpointBuilder')
const input = require('./../utils/input')
const Spinner = require('./../utils/spinner')
const path = require('path')
const klawSync = require('klaw-sync')
const fs = require('fs-extra')

const createBucket = async (cos, bucketName) => {
  await cos
    .createBucket({
      Bucket: bucketName,
      CreateBucketConfiguration: { LocationConstraint: null }
    })
    .promise()
}

const uploadBucket = async (cos, bucket, dir) => {
  const files = klawSync(dir, { nodir: true })

  const promises = files.map(file =>
    fs.readFile(file.path).then(data =>
      cos
        .upload({
          Bucket: bucket,
          Key: path.relative(dir, file.path),
          Body: data
        })
        .promise()
    )
  )

  await Promise.all(promises)
}

module.exports = async options => {
  // Parse help options.
  const parser = optionsParse()
  parser.add('path')
  parser.add(['--config', '-c'])
  parser.add([true, 'help', '--help', '-help', '-h'])
  const ops = parser.parse(options)

  // If help was an option, print usage and exit.
  if (ops.help) {
    console.log('cacli bootstrap <path>')
    return process.exit()
  }

  if (!ops.path) {
    console.log('No path provided')
    console.log('Usage: cacli bootstrap <path>')
    return process.exit(1)
  }

  const config = await loadCredentials()

  const bucket = await input('Name for your new bucket: ')

  const spinner = new Spinner()
  spinner.setMessage(`Creating ${bucket}...`)
  spinner.start()
  const { region, access_key_id, secret_access_key } = config.credentials.cos
  const cosConfig = {
    endpoint: cosEndpointBuilder(region, true),
    accessKeyId: access_key_id,
    secretAccessKey: secret_access_key
  }
  const cos = new COS.S3(cosConfig)
  await createBucket(cos, bucket)
  spinner.stop()

  spinner.setMessage(`Bootstraping ${bucket}...`)
  spinner.start()
  await uploadBucket(cos, bucket, ops.path)
  spinner.stop()
  console.log(`${green('success')} Bootstrap complete.`)
}
