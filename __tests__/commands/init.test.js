const assert = require('assert')
const sinon = require('sinon')
const rewire = require('rewire')
const stdin = require('mock-stdin').stdin
const fs = require('fs-extra')
const COS = require('ibm-cos-sdk')
const init = rewire('./../../src/commands/init')
const api = require('./../../src/api/api')

const wait = () =>
  new Promise((resolve, _) => {
    process.nextTick(resolve)
  })

describe('init', () => {
  const tmpConfig = '__tests__/.tmp/config.yaml'

  const keys = {
    enter: '\x0D'
  }

  let io = null
  beforeEach(() => {
    io = stdin()
    try {
      fs.removeSync('__tests__/.tmp/')
    } catch {}
  })
  afterEach(() => {
    io.restore()
    fs.removeSync('__tests__/.tmp/')
  })

  it('dry run', async () => {
    const promise = init(['--config', tmpConfig]).then(config => {
      const expected = {
        name: 'untitled-project',
        credentials: {
          wml: { instance_id: '', username: '', password: '', url: '' },
          cos: { access_key_id: '', secret_access_key: '', region: 'us-geo' }
        },
        buckets: { training: '' },
        trainingParams: { gpu: 'k80', steps: '500' }
      }
      assert.deepEqual(config, expected)
    })
    // instance_id:
    await wait()
    io.send(keys.enter)

    // username:
    await wait()
    io.send(keys.enter)

    // password:
    await wait()
    io.send(keys.enter)

    // url:
    await wait()
    io.send(keys.enter)

    // access_key_id:
    await wait()
    io.send(keys.enter)

    // secret_access_key:
    await wait()
    io.send(keys.enter)

    // region: (us-geo)
    await wait()
    io.send(keys.enter)

    // gpu: (k80)
    await wait()
    io.send(keys.enter)

    // steps: (500)
    await wait()
    io.send(keys.enter)

    // project name: (untitled-project)
    await wait()
    io.send(keys.enter)

    // Is this ok? (yes)
    await wait()
    io.send(keys.enter)

    return promise
  })

  const runWithCredentials = async () => {
    // instance_id:
    await wait()
    io.send(keys.enter)

    // username:
    await wait()
    io.send('username')
    io.send(keys.enter)

    // password:
    await wait()
    io.send('password')
    io.send(keys.enter)

    // url:
    await wait()
    io.send('url')
    io.send(keys.enter)

    // access_key_id:
    await wait()
    io.send('access_key_id')
    io.send(keys.enter)

    // secret_access_key:
    await wait()
    io.send('secret_access_key')
    io.send(keys.enter)

    // region: (us-geo)
    await wait()
    io.send(keys.enter)

    // training data bucket:
    await wait()
    io.send(keys.enter)

    // Would you like to store output in a separate bucket? (yes)
    await wait()
    io.send(keys.enter)

    // output bucket:
    await wait()
    io.send(keys.enter)

    // gpu: (k80)
    await wait()
    io.send(keys.enter)

    // steps: (500)
    await wait()
    io.send(keys.enter)

    // project name: (bucket)
    await wait()
    io.send(keys.enter)

    // Is this ok? (yes)
    await wait()
    io.send(keys.enter)
  }

  const runWithCredentialsAlt = async () => {
    // instance_id:
    await wait()
    io.send(keys.enter)

    // username:
    await wait()
    io.send('username')
    io.send(keys.enter)

    // password:
    await wait()
    io.send('password')
    io.send(keys.enter)

    // url:
    await wait()
    io.send('url')
    io.send(keys.enter)

    // access_key_id:
    await wait()
    io.send('access_key_id')
    io.send(keys.enter)

    // secret_access_key:
    await wait()
    io.send('secret_access_key')
    io.send(keys.enter)

    // region: (us-geo)
    await wait()
    io.send(keys.enter)

    // training data bucket:
    await wait()
    io.send(keys.enter)

    // Would you like to store output in a separate bucket? (yes)
    await wait()
    io.send('no')
    io.send(keys.enter)

    // gpu: (k80)
    await wait()
    io.send('v100')
    io.send(keys.enter)

    // steps: (500)
    await wait()
    io.send('6000')
    io.send(keys.enter)

    // project name: (bucket)
    await wait()
    io.send(keys.enter)

    // Is this ok? (yes)
    await wait()
    io.send('no')
    io.send(keys.enter)
  }

  it('fake credentials', async () => {
    sinon.stub(api, 'authenticate').returns('fake_token')

    sinon.stub(COS, 'S3').returns({
      listBuckets: () => ({
        promise: () =>
          new Promise((resolve, _) => {
            return resolve({
              Buckets: [
                { Name: 'bucket' },
                { Name: 'bucket' },
                { Name: 'bucket' }
              ]
            })
          })
      })
    })

    const promise = init(['--config', tmpConfig]).then(config => {
      api.authenticate.restore()
      COS.S3.restore()
      const expected = {
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
      assert.deepEqual(config, expected)
    })

    await runWithCredentials()

    return promise
  })

  it('alternate answers', async () => {
    sinon.stub(api, 'authenticate').returns('fake_token')

    sinon.stub(COS, 'S3').returns({
      listBuckets: () => ({
        promise: () =>
          new Promise((resolve, _) => {
            return resolve({
              Buckets: [
                { Name: 'bucket' },
                { Name: 'bucket' },
                { Name: 'bucket' }
              ]
            })
          })
      })
    })

    const promise = init(['--config', tmpConfig]).then(config => {
      api.authenticate.restore()
      COS.S3.restore()
      const expected = {
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
        buckets: { training: 'bucket' },
        trainingParams: { gpu: 'v100', steps: '6000' }
      }
      assert.deepEqual(config, expected)
    })

    await runWithCredentialsAlt()

    return promise
  })

  it('InvalidAccessKeyId', async () => {
    sinon.stub(api, 'authenticate').returns('fake_token')

    sinon.stub(COS, 'S3').returns({
      listBuckets: () => {
        const error = new Error()
        error.code = 'InvalidAccessKeyId'
        throw error
      }
    })

    const promise = init(['--config', tmpConfig]).then(config => {
      api.authenticate.restore()
      COS.S3.restore()
      const expected = {
        name: 'untitled-project',
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
        buckets: { training: '' },
        trainingParams: { gpu: 'k80', steps: '500' }
      }
      assert.deepEqual(config, expected)
    })

    await runWithCredentials()

    return promise
  })

  it('CredentialsError', async () => {
    sinon.stub(api, 'authenticate').returns('fake_token')

    sinon.stub(COS, 'S3').returns({
      listBuckets: () => {
        const error = new Error()
        error.code = 'CredentialsError'
        throw error
      }
    })

    const promise = init(['--config', tmpConfig]).then(config => {
      api.authenticate.restore()
      COS.S3.restore()
      const expected = {
        name: 'untitled-project',
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
        buckets: { training: '' },
        trainingParams: { gpu: 'k80', steps: '500' }
      }
      assert.deepEqual(config, expected)
    })

    await runWithCredentials()

    return promise
  })

  it('SignatureDoesNotMatch', async () => {
    sinon.stub(api, 'authenticate').returns('fake_token')

    sinon.stub(COS, 'S3').returns({
      listBuckets: () => {
        const error = new Error()
        error.code = 'SignatureDoesNotMatch'
        throw error
      }
    })

    const promise = init(['--config', tmpConfig]).then(config => {
      api.authenticate.restore()
      COS.S3.restore()
      const expected = {
        name: 'untitled-project',
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
        buckets: { training: '' },
        trainingParams: { gpu: 'k80', steps: '500' }
      }
      assert.deepEqual(config, expected)
    })

    await runWithCredentials()

    return promise
  })

  it('UnknownEndpoint', async () => {
    sinon.stub(api, 'authenticate').returns('fake_token')

    sinon.stub(COS, 'S3').returns({
      listBuckets: () => {
        const error = new Error()
        error.code = 'UnknownEndpoint'
        throw error
      }
    })

    const promise = init(['--config', tmpConfig]).then(config => {
      api.authenticate.restore()
      COS.S3.restore()
      const expected = {
        name: 'untitled-project',
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
        buckets: { training: '' },
        trainingParams: { gpu: 'k80', steps: '500' }
      }
      assert.deepEqual(config, expected)
    })

    await runWithCredentials()

    return promise
  })

  it('UnknownError', async () => {
    sinon.stub(api, 'authenticate').returns('fake_token')

    sinon.stub(COS, 'S3').returns({
      listBuckets: () => {
        const error = new Error()
        error.code = 'FakeError'
        throw error
      }
    })

    const promise = init(['--config', tmpConfig]).then(config => {
      api.authenticate.restore()
      COS.S3.restore()
      const expected = {
        name: 'untitled-project',
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
        buckets: { training: '' },
        trainingParams: { gpu: 'k80', steps: '500' }
      }
      assert.deepEqual(config, expected)
    })

    await runWithCredentials()

    return promise
  })

  it('valid region', async () => {
    sinon.stub(api, 'authenticate').returns('fake_token')

    sinon.stub(COS, 'S3').returns({
      listBuckets: () => ({
        promise: () =>
          new Promise((resolve, _) => {
            return resolve({
              Buckets: [
                { Name: 'bucket' },
                { Name: 'bucket' },
                { Name: 'bucket' }
              ]
            })
          })
      }),
      getBucketLocation: () => ({
        promise: () =>
          new Promise((resolve, _) => {
            return resolve({ LocationConstraint: 'fake-location' })
          })
      })
    })

    const promise = init(['--config', tmpConfig]).then(config => {
      api.authenticate.restore()
      COS.S3.restore()
      const expected = {
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
      assert.deepEqual(config, expected)
    })

    await runWithCredentials()

    return promise
  })

  it('invalid region', async () => {
    sinon.stub(api, 'authenticate').returns('fake_token')

    sinon.stub(COS, 'S3').returns({
      listBuckets: () => ({
        promise: () =>
          new Promise((resolve, _) => {
            return resolve({
              Buckets: [
                { Name: 'bucket' },
                { Name: 'bucket' },
                { Name: 'bucket' }
              ]
            })
          })
      }),
      getBucketLocation: () => ({
        promise: () =>
          new Promise((resolve, _) => {
            return resolve({})
          })
      })
    })

    const promise = init(['--config', tmpConfig]).then(config => {
      api.authenticate.restore()
      COS.S3.restore()
      const expected = {
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
      assert.deepEqual(config, expected)
    })

    await runWithCredentials()

    return promise
  })

  it('displays help', async () => {
    sinon.stub(process, 'exit')
    await init(['--help'])
    process.exit.restore()
  })

  it('skip steps', async () => {
    const promise = init(['--config', tmpConfig], true).then(config => {
      const expected = {
        name: 'untitled-project',
        credentials: {
          wml: { instance_id: '', username: '', password: '', url: '' },
          cos: { access_key_id: '', secret_access_key: '', region: 'us-geo' }
        },
        buckets: { training: '' },
        trainingParams: {}
      }
      assert.deepEqual(config, expected)
    })
    // instance_id:
    await wait()
    io.send(keys.enter)

    // username:
    await wait()
    io.send(keys.enter)

    // password:
    await wait()
    io.send(keys.enter)

    // url:
    await wait()
    io.send(keys.enter)

    // access_key_id:
    await wait()
    io.send(keys.enter)

    // secret_access_key:
    await wait()
    io.send(keys.enter)

    // region: (us-geo)
    await wait()
    io.send(keys.enter)

    // Is this ok? (yes)
    await wait()
    io.send(keys.enter)

    return promise
  })
})
