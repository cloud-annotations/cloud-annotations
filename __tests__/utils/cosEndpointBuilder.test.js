const assert = require('assert')
const cosEndpointBuilder = require('./../../src/utils/cosEndpointBuilder')

describe('cosEndpointBuilder', () => {
  it('us-geo local', () => {
    const region = 'us-geo'
    const endpoint = cosEndpointBuilder(region, true)
    assert(endpoint === `https://s3-api.${region}.objectstorage.softlayer.net`)
  })

  it('non us-geo local', () => {
    const region = 'us-south'
    const endpoint = cosEndpointBuilder(region, true)
    assert(endpoint === `https://s3.${region}.objectstorage.softlayer.net`)
  })

  it('us-geo private', () => {
    const region = 'us-geo'
    const endpoint = cosEndpointBuilder(region, false)
    assert(
      endpoint ===
        `https://s3-api.${region}.objectstorage.service.networklayer.com`
    )
  })

  it('non us-geo private', () => {
    const region = 'us-south'
    const endpoint = cosEndpointBuilder(region, false)
    assert(
      endpoint === `https://s3.${region}.objectstorage.service.networklayer.com`
    )
  })
})
