const { dim, green, red } = require('chalk')
const loadCredentials = require('./../utils/loadCredentials')
const COS = require('ibm-cos-sdk')
const optionsParse = require('./../utils/optionsParse')
const cosEndpointBuilder = require('./../utils/cosEndpointBuilder')
const cosHandleErrors = require('./../utils/cosHandleErrors')
const Spinner = require('./../utils/spinner')
const picker = require('./../utils/picker')
const fs = require('fs-extra')

const fileList = async (cos, bucket, continuationToken, list = []) => {
  const currentList = await cos
    .listObjectsV2({ Bucket: bucket, ContinuationToken: continuationToken })
    .promise()

  const files = [
    ...list,
    ...currentList.Contents.map(o => o.Key).filter(name => !name.endsWith('/'))
  ]

  if (currentList.NextContinuationToken) {
    return fileList(cos, bucket, currentList.NextContinuationToken, files)
  } else {
    return files
  }
}

const downloadBucket = async (cos, bucket, path) => {
  const files = await fileList(cos, bucket)
  const promises = files.map(file => {
    const outputPath = `./${path}/${bucket}/${file}`
    return cos
      .getObject({
        Bucket: bucket,
        Key: file
      })
      .promise()
      .then(data => fs.outputFile(outputPath, data.Body))
  })
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

async function checkRegion(
  { region, access_key_id, secret_access_key },
  bucket
) {
  const config = {
    endpoint: cosEndpointBuilder(region, true),
    accessKeyId: access_key_id,
    secretAccessKey: secret_access_key
  }
  const cos = new COS.S3(config)
  try {
    // only returns if bucket is in region.
    await cos
      .getBucketLocation({ Bucket: bucket })
      .promise()
      .then(data => data.LocationConstraint)
    return true
  } catch {
    return false
  }
}

module.exports = async options => {
  // Parse help options.
  const parser = optionsParse()
  parser.add(['--config', '-c'])
  parser.add([true, '--create-ml'])
  parser.add([true, 'help', '--help', '-help', '-h'])
  const ops = parser.parse(options)

  // If help was an option, print usage and exit.
  if (ops.help) {
    console.log('cacli export                  Export complete Bucket')
    console.log('cacli export --create-ml      Export annotations for Apples Create ML')
    return process.exit()
  }

  const config = await loadCredentials(true)

  const spinner = new Spinner()
  spinner.setMessage('Authenticating...')
  spinner.start()

  let buckets
  try {
    buckets = await listBuckets(config.credentials.cos)
    spinner.stop()
  } catch (e) {
    spinner.stop()
    cosHandleErrors(e, red('error'))
    return process.exit(1)
  }

  if (buckets.length === 0) {
    console.error(`${red('error')} No buckets available.`)
    return process.exit(1)
  }

  const bucket = await picker(
    `Choose a bucket to export: ${dim('(Use arrow keys)')}`,
    buckets
  )

  spinner.setMessage(`Checking bucket...`)

  if (!(await checkRegion(config.credentials.cos, bucket))) {
    spinner.stop()
    console.error(
      `${red('error')} The selected bucket is not in the region \`${
        config.credentials.cos.region
      }\`.`
    )
    return process.exit(1)
  }

  spinner.stop()

  spinner.setMessage(`Exporting ${bucket}...`)
  spinner.start()
  const { region, access_key_id, secret_access_key } = config.credentials.cos
  const cosConfig = {
    endpoint: cosEndpointBuilder(region, true),
    accessKeyId: access_key_id,
    secretAccessKey: secret_access_key
  }
  const cos = new COS.S3(cosConfig)
  await downloadBucket(cos, bucket, 'exported_buckets')

  if (ops.createml) {
    const sizeOf = require('image-size')
    const obj = JSON.parse(
      fs.readFileSync(`exported_buckets/${bucket}/_annotations.json`, 'utf8')
    )
    if (obj.type === 'localization') {
      const newAnnotations = Object.keys(obj.annotations).map(image => {
        const dimensions = sizeOf(`exported_buckets/${bucket}/${image}`)
        const annotations = obj.annotations[image].map(annotation => {
          const relWidth = annotation.x2 - annotation.x
          const relHeight = annotation.y2 - annotation.y
          const midX = (annotation.x + relWidth / 2) * dimensions.width
          const midY = (annotation.y + relHeight / 2) * dimensions.height
          const width = relWidth * dimensions.width
          const height = relHeight * dimensions.height
          return {
            label: annotation.label,
            coordinates: {
              x: Math.round(midX),
              y: Math.round(midY),
              width: Math.round(width),
              height: Math.round(height)
            }
          }
        })
        return {
          image: image,
          annotations: annotations
        }
      })

      fs.writeFileSync(
        `exported_buckets/${bucket}/annotations.json`,
        JSON.stringify(newAnnotations),
        'utf8'
      )

      fs.removeSync(`exported_buckets/${bucket}/_annotations.json`)
    }
  }

  spinner.stop()
  console.log(`${green('success')} Export complete.`)
}