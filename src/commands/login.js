const { bold, yellow } = require('chalk')
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

const DEFAULT_REGION = 'us-geo'

module.exports = async () => {
  const credentials = new CredentialsBuilder({})

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
    await new WML(credentials).authenticate()
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
  const access_key_id = credentials.accessKey()
  credentials.setAccessKey(await input('access_key_id: ', access_key_id))

  const secret_access_key = credentials.secret()
  credentials.setSecret(await input('secret_access_key: ', secret_access_key))

  const region = credentials.region()
  credentials.setRegion(await input('region: ', region || DEFAULT_REGION))
  console.log()

  // Authenticate Cloud Object Storage credentials.
  spinner.setMessage('Authenticating...')
  spinner.start()

  try {
    await authenticate({
      region: credentials.region(),
      access_key_id: credentials.accessKey(),
      secret_access_key: credentials.secret()
    })
    spinner.stop()
  } catch (e) {
    spinner.stop()
    cosHandleErrors(e, yellow('warning'))
  }

  credentials.outputFile()
  return credentials.credentials
}
