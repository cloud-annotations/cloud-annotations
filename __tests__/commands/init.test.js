const assert = require('assert').strict
const sinon = require('sinon')
const stdin = require('mock-stdin').stdin
const fs = require('fs-extra')
const init = require('./../../src/commands/init')
const wait = require('./../wait')

const allBlank = {
  instance_id: '',
  api_key: '',
  url: '',
  access_key_id: '',
  secret_access_key: '',
  region: '',
  gpu: '',
  steps: '',
  name: '',
  save: ''
}

const credentials = {
  instance_id: 'instance_id',
  api_key: 'api_key',
  url: 'url',
  access_key_id: 'access_key_id',
  secret_access_key: 'secret_access_key',
  region: '',
  training_bucket: '',
  use_output: '',
  output_bucket: '',
  gpu: '',
  steps: '',
  name: '',
  save: ''
}

const overrides = {
  instance_id: '',
  api_key: 'api_key',
  url: 'url',
  access_key_id: 'access_key_id',
  secret_access_key: 'secret_access_key',
  region: '',
  training_bucket: '',
  use_output: 'no',
  gpu: 'v100',
  steps: '6000',
  name: '',
  save: 'no'
}

const invalidAccessKeyId = {
  instance_id: '',
  api_key: 'api_key',
  url: 'url',
  access_key_id: 'fake',
  secret_access_key: 'secret_access_key',
  region: '',
  gpu: '',
  steps: '',
  name: '',
  save: ''
}

const signatureDoesNotMatch = {
  instance_id: '',
  api_key: 'api_key',
  url: 'url',
  access_key_id: 'access_key_id',
  secret_access_key: 'fake',
  region: '',
  gpu: '',
  steps: '',
  name: '',
  save: ''
}

const unknownEndpoint = {
  instance_id: '',
  api_key: 'api_key',
  url: 'url',
  access_key_id: 'access_key_id',
  secret_access_key: 'secret_access_key',
  region: 'fake',
  gpu: '',
  steps: '',
  name: '',
  save: ''
}

const unknownError = {
  instance_id: '',
  api_key: 'api_key',
  url: 'url',
  access_key_id: 'access_key_id',
  secret_access_key: 'secret_access_key',
  region: 'random-error',
  gpu: '',
  steps: '',
  name: '',
  save: ''
}

const invalidRegion = {
  instance_id: '',
  api_key: 'api_key',
  url: 'url',
  access_key_id: 'access_key_id',
  secret_access_key: 'secret_access_key',
  region: '',
  training_bucket: '\x1B\x5B\x42',
  use_output: '',
  output_bucket: '\x1B\x5B\x42\x1B\x5B\x42',
  gpu: '',
  steps: '',
  name: '',
  save: ''
}

const noBuckets = {
  instance_id: '',
  api_key: 'api_key',
  url: 'url',
  access_key_id: 'access_key_id',
  secret_access_key: 'secret_access_key',
  region: 'empty',
  gpu: '',
  steps: '',
  name: '',
  save: ''
}

const skippedSteps = {
  instance_id: '',
  api_key: '',
  url: '',
  access_key_id: '',
  secret_access_key: '',
  region: '',
  save: ''
}

describe('init', () => {
  const tmpConfig = '__tests__/.tmp/config.yaml'

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

  it('config only has gpu', async () => {
    sinon.stub(fs, 'outputFileSync')
    const promise = init(['--config', '__tests__/config.4.yaml']).then(
      config => {
        const expected = {
          name: 'fake',
          buckets: { training: 'bucket', output: 'bucket' },
          trainingParams: { gpu: 'k80', steps: '500' }
        }
        assert.deepEqual(config, expected)
      }
    )
    await runWith(credentials)
    return promise
  })

  it('config only has steps', async () => {
    sinon.stub(fs, 'outputFileSync')
    const promise = init(['--config', '__tests__/config.5.yaml']).then(
      config => {
        const expected = {
          name: 'fake',
          buckets: { training: 'bucket', output: 'bucket' },
          trainingParams: { gpu: 'k80', steps: '500' }
        }
        assert.deepEqual(config, expected)
      }
    )
    await runWith(credentials)
    return promise
  })

  it('config has gpu and steps', async () => {
    sinon.stub(fs, 'outputFileSync')
    const promise = init(['--config', '__tests__/config.3.yaml']).then(
      config => {
        const expected = {
          name: 'fake',
          buckets: { training: 'bucket', output: 'bucket' },
          trainingParams: { gpu: 'k80', steps: '500' }
        }
        assert.deepEqual(config, expected)
      }
    )
    await runWith(credentials)
    return promise
  })

  it('no config', async () => {
    const promise = init(['--config', tmpConfig]).then(config => {
      const expected = {
        name: 'bucket',
        buckets: { training: 'bucket', output: 'bucket' },
        trainingParams: { gpu: 'k80', steps: '500' }
      }
      assert.deepEqual(config, expected)
    })
    await runWith(credentials)
    return promise
  })

  // it('outputs proper config with credentials', async () => {
  //   const promise = init(['--config', tmpConfig]).then(config => {
  //     const expected = {
  //       name: 'bucket',
  //       buckets: { training: 'bucket', output: 'bucket' },
  //       trainingParams: { gpu: 'k80', steps: '500' }
  //     }
  //     assert.deepEqual(config, expected)
  //   })
  //   await runWith(credentials)
  //   return promise
  // })

  // it('outputs proper config with default overrides', async () => {
  //   const promise = init(['--config', tmpConfig]).then(config => {
  //     const expected = {
  //       name: 'bucket',
  //       buckets: { training: 'bucket' },
  //       trainingParams: { gpu: 'v100', steps: '6000' }
  //     }
  //     assert.deepEqual(config, expected)
  //   })
  //   await runWith(overrides)
  //   return promise
  // })

  // it('InvalidAccessKeyId', async () => {
  //   const promise = init(['--config', tmpConfig]).then(config => {
  //     const expected = {
  //       name: 'untitled-project',
  //       buckets: { training: '' },
  //       trainingParams: { gpu: 'k80', steps: '500' }
  //     }
  //     assert.deepEqual(config, expected)
  //   })
  //   await runWith(invalidAccessKeyId)
  //   return promise
  // })

  // it('SignatureDoesNotMatch', async () => {
  //   const promise = init(['--config', tmpConfig]).then(config => {
  //     const expected = {
  //       name: 'untitled-project',
  //       buckets: { training: '' },
  //       trainingParams: { gpu: 'k80', steps: '500' }
  //     }
  //     assert.deepEqual(config, expected)
  //   })
  //   await runWith(signatureDoesNotMatch)
  //   return promise
  // })

  // it('UnknownEndpoint', async () => {
  //   const promise = init(['--config', tmpConfig]).then(config => {
  //     const expected = {
  //       name: 'untitled-project',
  //       buckets: { training: '' },
  //       trainingParams: { gpu: 'k80', steps: '500' }
  //     }
  //     assert.deepEqual(config, expected)
  //   })
  //   await runWith(unknownEndpoint)
  //   return promise
  // })

  // it('UnknownError', async () => {
  //   const promise = init(['--config', tmpConfig]).then(config => {
  //     const expected = {
  //       name: 'untitled-project',
  //       buckets: { training: '' },
  //       trainingParams: { gpu: 'k80', steps: '500' }
  //     }
  //     assert.deepEqual(config, expected)
  //   })
  //   await runWith(unknownError)
  //   return promise
  // })

  // it('invalid region', async () => {
  //   const promise = init(['--config', tmpConfig]).then(config => {
  //     const expected = {
  //       name: 'out-of-region',
  //       buckets: { training: 'out-of-region', output: 'random-error' },
  //       trainingParams: { gpu: 'k80', steps: '500' }
  //     }
  //     assert.deepEqual(config, expected)
  //   })
  //   await runWith(invalidRegion)
  //   return promise
  // })

  // it('no buckets', async () => {
  //   const promise = init(['--config', tmpConfig]).then(config => {
  //     const expected = {
  //       name: 'untitled-project',
  //       buckets: { training: '' },
  //       trainingParams: { gpu: 'k80', steps: '500' }
  //     }
  //     assert.deepEqual(config, expected)
  //   })
  //   await runWith(noBuckets)
  //   return promise
  // })

  // it('skip steps', async () => {
  //   const promise = init(['--config', tmpConfig], true).then(config => {
  //     const expected = {
  //       name: 'untitled-project',
  //       buckets: { training: '' }
  //     }
  //     assert.deepEqual(config, expected)
  //   })
  //   await runWith(skippedSteps)
  //   return promise
  // })

  it('displays help', async () => {
    sinon.stub(process, 'exit')
    await init(['--help'])
  })

  const runWith = async run => {
    const keys = { enter: '\x0D' }

    await wait()
    await wait()
    io.send(run.instance_id)
    io.send(keys.enter)

    await wait()
    io.send(run.api_key)
    io.send(keys.enter)

    await wait()
    io.send(run.url)
    io.send(keys.enter)

    await wait()
    io.send(run.access_key_id)
    io.send(keys.enter)

    await wait()
    io.send(run.secret_access_key)
    io.send(keys.enter)

    await wait()
    io.send(run.region)
    io.send(keys.enter)

    if (run.hasOwnProperty('training_bucket')) {
      await wait()
      io.send(run.training_bucket)
      io.send(keys.enter)
    }

    if (run.hasOwnProperty('use_output')) {
      await wait()
      io.send(run.use_output)
      io.send(keys.enter)
    }

    if (run.hasOwnProperty('output_bucket')) {
      await wait()
      io.send(run.output_bucket)
      io.send(keys.enter)
    }

    if (run.hasOwnProperty('gpu')) {
      await wait()
      io.send(run.gpu)
      io.send(keys.enter)
    }

    if (run.hasOwnProperty('steps')) {
      await wait()
      io.send(run.steps)
      io.send(keys.enter)
    }

    if (run.hasOwnProperty('name')) {
      await wait()
      io.send(run.name)
      io.send(keys.enter)
    }

    await wait()
    io.send(run.save)
    io.send(keys.enter)
  }
})
