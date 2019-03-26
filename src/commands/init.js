const { dim, bold, yellow } = require('chalk')
const input = require('./../utils/input')
const safeGet = require('./../utils/safeGet')
const yaml = require('js-yaml')
const fs = require('fs')
const COS = require('ibm-cos-sdk')
const WML = require('./../api/wml')
const stringToBool = require('./../utils/stringToBool')
const optionsParse = require('./../utils/optionsParse')
const cosEndpointBuilder = require('./../utils/cosEndpointBuilder')
const Spinner = require('./../utils/spinner')
const picker = require('./../utils/picker')
const { eraseLines } = require('ansi-escapes')

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
    const region = await cos
      .getBucketLocation({ Bucket: bucket })
      .promise()
      .then(data => data.LocationConstraint)
    if (region) {
      return true
    }
    return false
  } catch {
    return false
  }
}

const DEFAULT_NAME = 'untitled-project'
const DEFAULT_REGION = 'us-geo'
const DEFAULT_USE_OUTPUT = 'yes'
const DEFAULT_GPU = 'k80'
const DEFAULT_STEPS = '500'
const DEFAULT_SAVE = 'yes'

const CONFIG = {
  name: '',
  credentials: { wml: {}, cos: {} },
  buckets: { training: '' },
  trainingParams: {}
}

module.exports = async (options, skipOptionalSteps) => {
  // Parse help options.
  const parser = optionsParse()
  parser.add([true, 'help', '--help', '-h'])
  const ops = parser.parse(options)

  // If help was an option, print usage and exit.
  if (ops.help) {
    console.log('cacli init')
    process.exit()
  }

  // Load config if one exists.
  const old = safeGet(() => yaml.safeLoad(fs.readFileSync('config.yaml')))

  if (!skipOptionalSteps) {
    console.log(
      dim('This utility will walk you through creating a config.yaml file.')
    )
    console.log(
      dim(
        'It only covers the most common items, and tries to guess sensible defaults.'
      )
    )
    console.log()
  }

  // Watson Machine Learning Credentials
  console.log(bold('Watson Machine Learning Credentials'))
  const instance_id = safeGet(() => old.credentials.wml.instance_id)
  CONFIG.credentials.wml.instance_id = await input('instance_id: ', instance_id)
  const username = safeGet(() => old.credentials.wml.username)
  CONFIG.credentials.wml.username = await input('username: ', username)
  const password = safeGet(() => old.credentials.wml.password)
  CONFIG.credentials.wml.password = await input('password: ', password)
  const url = safeGet(() => old.credentials.wml.url)
  CONFIG.credentials.wml.url = await input('url: ', url)
  console.log()

  const spinner = new Spinner()
  spinner.setMessage('Authenticating...')
  spinner.start()

  try {
    await new WML(CONFIG).authenticate()
    spinner.stop()
  } catch (e) {
    spinner.stop()
    console.warn(
      `${yellow(
        'warning'
      )} The provided Watson Machine Learning credentials are invalid.\n`
    )
  }

  // Cloud Object Storage Credentials
  console.log(bold('Cloud Object Storage Credentials'))
  const access_key_id = safeGet(() => old.credentials.cos.access_key_id)
  CONFIG.credentials.cos.access_key_id = await input(
    'access_key_id: ',
    access_key_id
  )
  const secret_access_key = safeGet(() => old.credentials.cos.secret_access_key)
  CONFIG.credentials.cos.secret_access_key = await input(
    'secret_access_key: ',
    secret_access_key
  )
  const region = safeGet(() => old.credentials.cos.region, DEFAULT_REGION)
  CONFIG.credentials.cos.region = await input('region: ', region)
  console.log()

  // Buckets
  spinner.setMessage('Authenticating...')
  spinner.start()

  let buckets
  try {
    buckets = await listBuckets(CONFIG.credentials.cos)
    spinner.stop()
  } catch (e) {
    spinner.stop()
    switch (e.code) {
      case 'InvalidAccessKeyId':
        // InvalidAccessKeyId - The AWS Access Key ID you provided does not exist in our records.
        console.warn(
          `${yellow(
            'warning'
          )} The provided Cloud Object Storage \`access_key_id\` is invalid.`
        )
        break
      case 'CredentialsError':
        // CredentialsError - Missing credentials in config
        console.warn(
          `${yellow(
            'warning'
          )} No Cloud Object Storage credentials were provided.`
        )
        break
      case 'SignatureDoesNotMatch':
        // SignatureDoesNotMatch - The request signature we calculated does not match the signature you provided. Check your AWS Secret Access Key and signing method. For more information, see REST Authentication and SOAP Authentication for details.
        console.warn(
          `${yellow(
            'warning'
          )} The provided Cloud Object Storage \`secret_access_key\` is invalid.`
        )
        break
      case 'UnknownEndpoint':
        // UnknownEndpoint - Inaccessible host: `s3-api.XXX.objectstorage.softlayer.net'. This service may not be available in the `us-east-1' region.
        console.warn(
          `${yellow(
            'warning'
          )} The provided Cloud Object Storage \`region\` is invalid.`
        )
        break
      default:
        console.warn(`${yellow('warning')} ${e.code} - ${e.message}`)
        break
    }
    console.warn(
      `${yellow(
        'warning'
      )} Skipping bucket selection due to invalid authentication.\n`
    )
  }

  if (buckets) {
    console.log(bold('Buckets'))
    const training = safeGet(() => old.buckets.training)
    const i = Math.max(0, buckets.indexOf(training))
    CONFIG.buckets.training = await picker(
      `training data bucket: ${dim('(Use arrow keys)')}`,
      buckets,
      {
        default: i
      }
    )
    console.log(`training data bucket: ${CONFIG.buckets.training}`)
    console.log()

    const use_output = stringToBool(
      await input(
        'Would you like to store output in a separate bucket? ',
        DEFAULT_USE_OUTPUT
      )
    )
    process.stdout.write(eraseLines(3))
    console.log()

    await (async () => {
      if (use_output) {
        process.stdout.write(eraseLines(2))
        const output = safeGet(() => old.buckets.output)
        const i = Math.max(0, buckets.indexOf(output))
        CONFIG.buckets.output = await picker(
          `output bucket: ${dim('(Use arrow keys)')}`,
          buckets,
          {
            default: i
          }
        )
        console.log(`output bucket: ${CONFIG.buckets.output}`)
        console.log()
      }
    })()
  }

  spinner.setMessage('Checking buckets...')
  spinner.start()

  let validTraining = true
  if (CONFIG.buckets.training) {
    validTraining = await checkRegion(
      CONFIG.credentials.cos,
      CONFIG.buckets.training
    )
  }

  let validOutput = true
  if (CONFIG.buckets.output) {
    validOutput = await checkRegion(
      CONFIG.credentials.cos,
      CONFIG.buckets.output
    )
  }

  spinner.stop()

  if (!validTraining) {
    console.warn(
      `${yellow(
        'warning'
      )} The selected training bucket is not in the region \`${
        CONFIG.credentials.cos.region
      }\`.`
    )
  }
  if (!validOutput) {
    console.warn(
      `${yellow('warning')} The selected output bucket is not in the region \`${
        CONFIG.credentials.cos.region
      }\`.`
    )
  }
  if (!validTraining || !validOutput) {
    console.log()
  }

  // Training Params
  if (!skipOptionalSteps) {
    console.log(bold('Training Params'))
    // Default can end up being '', which won't through a safeGet error.
    const gpu = safeGet(() => old.trainingParams.gpu, DEFAULT_GPU)
    CONFIG.trainingParams.gpu = await input('gpu: ', gpu || DEFAULT_GPU)
    const steps = safeGet(() => old.trainingParams.steps, DEFAULT_STEPS)
    CONFIG.trainingParams.steps = await input('steps: ', steps || DEFAULT_STEPS)
    console.log()
  }

  const defaultProjectName = CONFIG.buckets.training || DEFAULT_NAME

  // Project name
  if (!skipOptionalSteps) {
    CONFIG.name = await input('project name: ', defaultProjectName)
    console.log()
  } else {
    CONFIG.name = defaultProjectName
  }

  // Write to yaml
  console.log(`About to write to ${process.cwd()}/config.yaml:`)
  console.log()
  const yamlFile = yaml.safeDump(CONFIG)
  console.log(yamlFile)
  const save = stringToBool(await input('Is this ok? ', DEFAULT_SAVE))
  if (save) {
    fs.writeFile('config.yaml', yamlFile, () => {})
  }
  return CONFIG
}
