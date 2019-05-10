const { dim, bold, yellow } = require('chalk')
const input = require('./../utils/input')
const COS = require('ibm-cos-sdk')
const login = require('./../commands/login')
const stringToBool = require('./../utils/stringToBool')
const optionsParse = require('./../utils/optionsParse')
const ConfigBuilder = require('./../utils/configBuilder')
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
const DEFAULT_USE_OUTPUT = 'yes'
const DEFAULT_GPU = 'k80'
const DEFAULT_STEPS = '500'
const DEFAULT_SAVE = 'yes'

module.exports = async (options, skipOptionalSteps) => {
  const verbose = !skipOptionalSteps

  // Parse help options.
  const parser = optionsParse()
  parser.add(['--config', '-c'])
  parser.add([true, 'help', '--help', '-help', '-h'])
  const ops = parser.parse(options)

  // If help was an option, print usage and exit.
  if (ops.help) {
    console.log('cacli init')
    return process.exit()
  }

  const config = new ConfigBuilder(ops.config)

  if (verbose) {
    const line1 =
      'This utility will walk you through creating a config.yaml file.'
    const line2 =
      'It only covers the most common items, and tries to guess sensible defaults.'

    console.log(dim(line1))
    console.log(dim(line2))
    console.log()
  }

  const credentials = await login()

  const spinner = new Spinner()
  spinner.setMessage('Loading buckets...')
  spinner.start()

  let buckets
  try {
    buckets = await listBuckets(credentials.cos)
    spinner.stop()
  } catch (e) {
    spinner.stop()
    console.warn(
      `${yellow(
        'warning'
      )} Skipping bucket selection due to invalid authentication.\n`
    )
  }

  // Buckets
  if (buckets && buckets.length === 0) {
    console.error(
      `${yellow('warning')} Skipping bucket selection because no buckets exist.`
    )
  } else if (buckets) {
    console.log(bold('Buckets'))
    const i = Math.max(0, buckets.indexOf(config.trainingBucket()))
    config.setTrainingBucket(
      await picker(
        `training data bucket: ${dim('(Use arrow keys)')}`,
        buckets,
        {
          default: i
        }
      )
    )
    console.log(`training data bucket: ${config.trainingBucket()}`)
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
        const i = Math.max(0, buckets.indexOf(config.outputBucket()))
        config.setOutputBucket(
          await picker(`output bucket: ${dim('(Use arrow keys)')}`, buckets, {
            default: i
          })
        )
        console.log(`output bucket: ${config.outputBucket()}`)
        console.log()
      }
    })()
  }

  spinner.setMessage('Checking buckets...')
  spinner.start()

  let validTraining = true
  if (config.trainingBucket()) {
    validTraining = await checkRegion(credentials.cos, config.trainingBucket())
  }

  let validOutput = true
  if (config.outputBucket()) {
    validOutput = await checkRegion(credentials.cos, config.outputBucket())
  }

  spinner.stop()

  if (!validTraining) {
    console.warn(
      `${yellow(
        'warning'
      )} The selected training bucket is not in the region \`${
        credentials.cos.region
      }\`.`
    )
  }
  if (!validOutput) {
    console.warn(
      `${yellow('warning')} The selected output bucket is not in the region \`${
        credentials.cos.region
      }\`.`
    )
  }
  if (!validTraining || !validOutput) {
    console.log()
  }

  // Training Params
  if (verbose) {
    console.log(bold('Training Params'))
    // Default can end up being '', which won't through a safeGet error.
    config.setGPU(await input('gpu: ', config.gpu() || DEFAULT_GPU))
    config.setSteps(await input('steps: ', config.steps() || DEFAULT_STEPS))
    console.log()
  }

  const defaultProjectName =
    config.name() || config.trainingBucket() || DEFAULT_NAME

  // Project name
  if (verbose) {
    config.setName(await input('project name: ', defaultProjectName))
    console.log()
  } else {
    config.setName(defaultProjectName)
  }

  // Write to yaml
  console.log(`About to write to ${process.cwd()}/${config.configPath}`)
  console.log()
  const yamlFile = config.getYaml()
  console.log(yamlFile)
  const save = stringToBool(await input('Is this ok? ', DEFAULT_SAVE))
  if (save) {
    config.outputFile()
  }
  return config.config
}
