const { green, red } = require('chalk')
const CredentialsBuilder = require('./../utils/credentialsBuilder')

module.exports = async () => {
  console.log('Logging out...')

  const credentials = new CredentialsBuilder({})
  try {
    credentials.clear()
  } catch (e) {
    if (e.code !== 'ENOENT') {
      console.log(`${red('error')} ${e.message}`)
      return process.exit()
    }
  }
  console.log(green('success'))
}
