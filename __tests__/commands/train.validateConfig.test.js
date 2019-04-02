const assert = require('assert')
// const sinon = require('sinon')
const rewire = require('rewire')
const train = rewire('./../../src/commands/train')
// const mock = require('./../mock')

const api = require('./../../src/api/api')

describe('train validateConfig', () => {
  const fakeConfig = {
    name: 'bucket',
    credentials: {
      wml: {
        instance_id: '',
        username: 'username',
        password: 'password',
        url: 'url'
      },
      cos: {
        access_key_id: 'access_key_id',
        secret_access_key: 'secret_access_key',
        region: 'us-geo'
      }
    },
    buckets: { training: 'bucket', output: 'bucket' },
    trainingParams: { gpu: 'k80', steps: '500' }
  }

  it('exits with credential errors', async () => {
    try {
      const res = await api.authenticate()
      console.log(res)
    } catch {
      console.log('bad credentials')
    }

    try {
      const res = await api.authenticate('url', 'username', 'password')
      console.log(res)
    } catch {
      console.log('bad credentials')
    }

    // sinon.stub(process, 'exit')
    // train.__get__('validateConfig')(fakeConfig)
    // assert(process.exit.called)
    // process.exit.restore()
  })
})
