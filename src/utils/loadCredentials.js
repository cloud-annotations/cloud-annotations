const { dim } = require('chalk')
const CredentialsBuilder = require('./../utils/credentialsBuilder')
const { authCOS, authWML } = require('./../commands/login')
const login = require('./../commands/login')

module.exports = async onlyCOS => {
  try {
    const credentials = new CredentialsBuilder({})
    await authCOS(credentials)
    if (!onlyCOS) {
      await authWML(credentials)
    }
    return {
      credentials: credentials.credentials
    }
  } catch {
    console.log(dim('(Invalid credentials, running log in)'))
    console.log()
    return {
      credentials: await login(null, true, onlyCOS)
    }
  }
}
