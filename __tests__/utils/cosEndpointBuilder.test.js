const assert = require('assert').strict
const cosEndpointBuilder = require('./../../src/utils/cosEndpointBuilder')

describe('cosEndpointBuilder', () => {
  it('us-geo local', () => {
    const region = 'us-geo'
    const endpoint = cosEndpointBuilder(region, true)
    assert(endpoint === `https://s3.us.cloud-object-storage.appdomain.cloud`)
  })

  it('us local', () => {
    const region = 'us'
    const endpoint = cosEndpointBuilder(region, true)
    assert(endpoint === `https://s3.us.cloud-object-storage.appdomain.cloud`)
  })

  it('non us-geo local', () => {
    const region = 'us-south'
    const endpoint = cosEndpointBuilder(region, true)
    assert(
      endpoint === `https://s3.us-south.cloud-object-storage.appdomain.cloud`
    )
  })

  it('us-geo private', () => {
    const region = 'us-geo'
    const endpoint = cosEndpointBuilder(region, false)
    assert(
      endpoint === `https://s3.private.us.cloud-object-storage.appdomain.cloud`
    )
  })

  it('us private', () => {
    const region = 'us'
    const endpoint = cosEndpointBuilder(region, false)
    assert(
      endpoint === `https://s3.private.us.cloud-object-storage.appdomain.cloud`
    )
  })

  it('non us-geo private', () => {
    const region = 'us-south'
    const endpoint = cosEndpointBuilder(region, false)
    assert(
      endpoint ===
        `https://s3.private.us-south.cloud-object-storage.appdomain.cloud`
    )
  })
})
