const { green, red } = require('chalk')
const loadConfig = require('./../utils/loadConfig')
const COS = require('ibm-cos-sdk')
const optionsParse = require('./../utils/optionsParse')
const cosEndpointBuilder = require('./../utils/cosEndpointBuilder')
const cosHandleErrors = require('./../utils/cosHandleErrors')
const Spinner = require('./../utils/spinner')
const input = require('./../utils/input')
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

async function listBuckets({ region, access_key_id, secret_access_key }) {
  const config = {
    endpoint: cosEndpointBuilder(region, true),
    accessKeyId: access_key_id,
    secretAccessKey: secret_access_key
  }
  const cos = new COS.S3(config)
  return await cos
    .listBuckets()
    .promise()
    .then(data =>
      data.Buckets.map(bucket => {
        return bucket.Name
      })
    )
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

  const config = loadConfig(ops.config)

  const spinner = new Spinner()
  spinner.setMessage('Authenticating...')
  spinner.start()

  try {
    await listBuckets(config.credentials.cos)
    spinner.stop()
  } catch (e) {
    spinner.stop()
    cosHandleErrors(e, red('error'))
    return process.exit(1)
  }

  const bucket = await input('Name for your new bucket: ')

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
