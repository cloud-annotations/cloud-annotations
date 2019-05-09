const { dim } = require('chalk')
const CredentialsBuilder = require('./../utils/credentialsBuilder')
const { authCOS, authWML } = require('./../commands/login')
const login = require('./../commands/login')

module.exports = async () => {
  try {
    const credentials = new CredentialsBuilder({})
    await authCOS(credentials)
    await authWML(credentials)
    return {
      credentials: credentials.credentials
    }
  } catch {
    console.log(dim('(Invalid credentials, running log in)'))
    console.log()
    return {
      credentials: await login(null, true)
    }
  }
}
