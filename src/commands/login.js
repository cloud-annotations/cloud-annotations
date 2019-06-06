const { bold, yellow, red } = require('chalk')
const input = require('./../utils/input')
const COS = require('ibm-cos-sdk')
const WML = require('./../api/wml')
const CredentialsBuilder = require('./../utils/credentialsBuilder')
const cosEndpointBuilder = require('./../utils/cosEndpointBuilder')
const cosHandleErrors = require('./../utils/cosHandleErrors')
const Spinner = require('./../utils/spinner')

async function authenticate({ region, access_key_id, secret_access_key }) {
  const config = {
    endpoint: cosEndpointBuilder(region, true),
    accessKeyId: access_key_id,
    secretAccessKey: secret_access_key
  }
  const cos = new COS.S3(config)
  return await cos.listBuckets().promise()
}

const DEFAULT_REGION = 'us'

const wmlLogin = async (credentials, force) => {
  // Watson Machine Learning Credentials
  console.log(bold('Watson Machine Learning Credentials'))
  const instance_id = credentials.instanceId()
  credentials.setInstanceId(await input('instance_id: ', instance_id))

  const username = credentials.username()
  credentials.setUsername(await input('username: ', username))

  const password = credentials.password()
  credentials.setPassword(await input('password: ', password))

  const url = credentials.url()
  credentials.setUrl(await input('url: ', url))
  console.log()

  // Authenticate Watson Machine Learning credentials.
  const spinner = new Spinner()
  spinner.setMessage('Authenticating...')
  spinner.start()

  try {
    await authWML(credentials)
    spinner.stop()
  } catch (e) {
    spinner.stop()
    if (force) {
      console.error(
        `${red(
          'error'
        )} The provided Watson Machine Learning credentials are invalid.\n`
      )
      await wmlLogin(credentials, force)
    } else {
      console.warn(
        `${yellow(
          'warning'
        )} The provided Watson Machine Learning credentials are invalid.\n`
      )
    }
  }
}

const cosLogin = async (credentials, force) => {
  // Cloud Object Storage Credentials
  console.log(bold('Cloud Object Storage Credentials'))
  const access_key_id = credentials.accessKey()
  credentials.setAccessKey(await input('access_key_id: ', access_key_id))

  const secret_access_key = credentials.secret()
  credentials.setSecret(await input('secret_access_key: ', secret_access_key))

  const region = credentials.region()
  credentials.setRegion(await input('region: ', region || DEFAULT_REGION))
  console.log()

  // Authenticate Cloud Object Storage credentials.
  const spinner = new Spinner()
  spinner.setMessage('Authenticating...')
  spinner.start()

  try {
    await authCOS(credentials)
    spinner.stop()
  } catch (e) {
    spinner.stop()
    if (force) {
      cosHandleErrors(e, red('error'))
      await cosLogin(credentials, force)
    } else {
      cosHandleErrors(e, yellow('warning'))
    }
  }
}

module.exports = async (_, force, onlyCOS) => {
  const credentials = new CredentialsBuilder({})

  if (!onlyCOS) {
    await wmlLogin(credentials, force)
  }
  await cosLogin(credentials, force)

  credentials.outputFile()
  return credentials.credentials
}

const authWML = async credentials => {
  await new WML(credentials).authenticate()
}
module.exports.authWML = authWML

const authCOS = async credentials => {
  await authenticate({
    region: credentials.region(),
    access_key_id: credentials.accessKey(),
    secret_access_key: credentials.secret()
  })
}
module.exports.authCOS = authCOS
