const { dim, bold, yellow } = require('chalk')
const input = require('./../utils/input')
const safeGet = require('./../utils/safeGet')
const yaml = require('js-yaml')
const fs = require('fs-extra')
const COS = require('ibm-cos-sdk')
const WML = require('./../api/wml')
const stringToBool = require('./../utils/stringToBool')
const optionsParse = require('./../utils/optionsParse')
const cosEndpointBuilder = require('./../utils/cosEndpointBuilder')
const cosHandleErrors = require('./../utils/cosHandleErrors')
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
  parser.add(['--config', '-c'])
  parser.add([true, 'help', '--help', '-help', '-h'])
  const ops = parser.parse(options)

  const configPath = ops.config || 'config.yaml'

  // If help was an option, print usage and exit.
  if (ops.help) {
    console.log('cacli init')
    return process.exit()
  }

  // Load config if one exists.
  const old = safeGet(() => yaml.safeLoad(fs.readFileSync(configPath)))

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

  // Deep copy.
  const config = JSON.parse(JSON.stringify(CONFIG))

  // Watson Machine Learning Credentials
  console.log(bold('Watson Machine Learning Credentials'))
  const instance_id = safeGet(() => old.credentials.wml.instance_id)
  config.credentials.wml.instance_id = await input('instance_id: ', instance_id)
  const username = safeGet(() => old.credentials.wml.username)
  config.credentials.wml.username = await input('username: ', username)
  const password = safeGet(() => old.credentials.wml.password)
  config.credentials.wml.password = await input('password: ', password)
  const url = safeGet(() => old.credentials.wml.url)
  config.credentials.wml.url = await input('url: ', url)
  console.log()

  const spinner = new Spinner()
  spinner.setMessage('Authenticating...')
  spinner.start()

  try {
    await new WML(config).authenticate()
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
  config.credentials.cos.access_key_id = await input(
    'access_key_id: ',
    access_key_id
  )
  const secret_access_key = safeGet(() => old.credentials.cos.secret_access_key)
  config.credentials.cos.secret_access_key = await input(
    'secret_access_key: ',
    secret_access_key
  )
  const region = safeGet(() => old.credentials.cos.region, DEFAULT_REGION)
  config.credentials.cos.region = await input('region: ', region)
  console.log()

  // Buckets
  spinner.setMessage('Authenticating...')
  spinner.start()

  let buckets
  try {
    buckets = await listBuckets(config.credentials.cos)
    spinner.stop()
  } catch (e) {
    spinner.stop()
    cosHandleErrors(e, yellow('warning'))
    console.warn(
      `${yellow(
        'warning'
      )} Skipping bucket selection due to invalid authentication.\n`
    )
  }

  if (buckets && buckets.length === 0) {
    console.error(
      `${yellow('warning')} Skipping bucket selection because no buckets exist.`
    )
  } else if (buckets) {
    console.log(bold('Buckets'))
    const training = safeGet(() => old.buckets.training)
    const i = Math.max(0, buckets.indexOf(training))
    config.buckets.training = await picker(
      `training data bucket: ${dim('(Use arrow keys)')}`,
      buckets,
      {
        default: i
      }
    )
    console.log(`training data bucket: ${config.buckets.training}`)
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
        config.buckets.output = await picker(
          `output bucket: ${dim('(Use arrow keys)')}`,
          buckets,
          {
            default: i
          }
        )
        console.log(`output bucket: ${config.buckets.output}`)
        console.log()
      }
    })()
  }

  spinner.setMessage('Checking buckets...')
  spinner.start()

  let validTraining = true
  if (config.buckets.training) {
    validTraining = await checkRegion(
      config.credentials.cos,
      config.buckets.training
    )
  }

  let validOutput = true
  if (config.buckets.output) {
    validOutput = await checkRegion(
      config.credentials.cos,
      config.buckets.output
    )
  }

  spinner.stop()

  if (!validTraining) {
    console.warn(
      `${yellow(
        'warning'
      )} The selected training bucket is not in the region \`${
        config.credentials.cos.region
      }\`.`
    )
  }
  if (!validOutput) {
    console.warn(
      `${yellow('warning')} The selected output bucket is not in the region \`${
        config.credentials.cos.region
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
    const gpu = safeGet(() => old.trainingParams.gpu)
    config.trainingParams.gpu = await input('gpu: ', gpu || DEFAULT_GPU)
    const steps = safeGet(() => old.trainingParams.steps)
    config.trainingParams.steps = await input('steps: ', steps || DEFAULT_STEPS)
    console.log()
  }

  const defaultProjectName = config.buckets.training || DEFAULT_NAME

  // Project name
  if (!skipOptionalSteps) {
    config.name = await input('project name: ', defaultProjectName)
    console.log()
  } else {
    config.name = defaultProjectName
  }

  // Write to yaml
  console.log(`About to write to ${process.cwd()}/${configPath}`)
  console.log()
  const yamlFile = yaml.safeDump(config)
  console.log(yamlFile)
  const save = stringToBool(await input('Is this ok? ', DEFAULT_SAVE))
  if (save) {
    fs.outputFile(configPath, yamlFile, () => {})
  }
  return config
}
