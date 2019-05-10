const CredentialsBuilder = require('./../../src/utils/credentialsBuilder')
const { fill } = require('./../mockCredentials')

describe('credentialsBuilder', () => {
  it('load fake profile', async () => {
    fill()
    new CredentialsBuilder({ profile: 'fake' })
  })
})
