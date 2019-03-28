const { dim, green, red } = require('chalk')
const loadConfig = require('./../utils/loadConfig')
const COS = require('ibm-cos-sdk')
const optionsParse = require('./../utils/optionsParse')
const cosEndpointBuilder = require('./../utils/cosEndpointBuilder')
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
  parser.add([true, 'help', '--help', '-help', '-h'])
  const ops = parser.parse(options)

  // If help was an option, print usage and exit.
  if (ops.help) {
    console.log('cacli bootstrap <path>')
    process.exit()
  }

  const config = loadConfig()

  const spinner = new Spinner()
  spinner.setMessage('Authenticating...')
  spinner.start()

  try {
    await listBuckets(config.credentials.cos)
    spinner.stop()
  } catch (e) {
    spinner.stop()
    switch (e.code) {
      case 'InvalidAccessKeyId':
        // InvalidAccessKeyId - The AWS Access Key ID you provided does not exist in our records.
        console.error(
          `${red(
            'error'
          )} The provided Cloud Object Storage \`access_key_id\` is invalid.`
        )
        process.exit(1)
      case 'CredentialsError':
        // CredentialsError - Missing credentials in config
        console.error(
          `${red('error')} No Cloud Object Storage credentials were provided.`
        )
        process.exit(1)
      case 'SignatureDoesNotMatch':
        // SignatureDoesNotMatch - The request signature we calculated does not match the signature you provided. Check your AWS Secret Access Key and signing method. For more information, see REST Authentication and SOAP Authentication for details.
        console.error(
          `${red(
            'error'
          )} The provided Cloud Object Storage \`secret_access_key\` is invalid.`
        )
        process.exit(1)
      case 'UnknownEndpoint':
        // UnknownEndpoint - Inaccessible host: `s3-api.XXX.objectstorage.softlayer.net'. This service may not be available in the `us-east-1' region.
        console.error(
          `${red(
            'error'
          )} The provided Cloud Object Storage \`region\` is invalid.`
        )
        process.exit(1)
      default:
        console.error(`${red('error')} ${e.code} - ${e.message}`)
        process.exit(1)
    }
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
