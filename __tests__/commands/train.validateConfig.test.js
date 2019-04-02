const assert = require('assert')
const sinon = require('sinon')
const rewire = require('rewire')
const train = rewire('./../../src/commands/train')

describe('train validateConfig', () => {
  const realCredentials = {
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

  const empty = {
    name: 'bucket',
    credentials: {
      wml: {
        instance_id: '',
        username: '',
        password: '',
        url: ''
      },
      cos: {
        access_key_id: '',
        secret_access_key: '',
        region: ''
      }
    },
    buckets: { training: '' }
  }

  const invalidRegion = {
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
    buckets: { training: 'out-of-region', output: 'out-of-region' }
  }

  it('finishes safely with good credentials', async () => {
    sinon.stub(process, 'exit')
    await train.__get__('validateConfig')(realCredentials)
    assert(!process.exit.called)
    process.exit.restore()
  })

  it('exits with no credentials', async () => {
    sinon.stub(process, 'exit')
    await train.__get__('validateConfig')(empty)
    assert(process.exit.called)
    process.exit.restore()
  })

  it('exits with wrong region', async () => {
    sinon.stub(process, 'exit')
    await train.__get__('validateConfig')(invalidRegion)
    assert(process.exit.called)
    process.exit.restore()
  })
})
