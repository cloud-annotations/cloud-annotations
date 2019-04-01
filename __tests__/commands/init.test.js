const sinon = require('sinon')
const assert = require('assert')
const init = require('./../../src/commands/init')
const stdin = require('mock-stdin').stdin

describe('init', () => {
  const keys = {
    enter: '\x0D'
  }

  let io = null
  beforeEach(() => {
    io = stdin()
    fs.removeSync('./__tests__/.tmp/')
  })
  afterEach(() => io.restore())

  it('dry run', done => {
    init(['--config=__tests__/.tmp/config.yaml']).then(config => {
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
      done()
    })
    // instance_id:
    process.nextTick(() => {
      io.send(keys.enter)
    })
    // username:
    process.nextTick(() => {
      io.send(keys.enter)
    })
    // password:
    process.nextTick(() => {
      io.send(keys.enter)
    })
    // url:
    process.nextTick(() => {
      io.send(keys.enter)
    })
    // access_key_id:
    process.nextTick(() => {
      io.send(keys.enter)
    })
    // secret_access_key:
    process.nextTick(() => {
      io.send(keys.enter)
    })
    // region: (us-geo)
    process.nextTick(() => {
      io.send(keys.enter)
    })
    // gpu: (k80)
    process.nextTick(() => {
      io.send(keys.enter)
    })
    // steps: (500)
    process.nextTick(() => {
      io.send(keys.enter)
    })
    // project name: (untitled-project)
    process.nextTick(() => {
      io.send(keys.enter)
    })
    // Is this ok? (yes)
    process.nextTick(() => {
      io.send(keys.enter)
    })
  })

  it('displays help', async () => {
    sinon.stub(process, 'exit')
    await init(['--help'])
    process.exit.restore()
  })

  it('skip steps', done => {
    init(['--config=__tests__/.tmp/config.yaml', true]).then(config => {
      const expected = {
        name: 'untitled-project',
        credentials: {
          wml: { instance_id: '', username: '', password: '', url: '' },
          cos: { access_key_id: '', secret_access_key: '', region: 'us-geo' }
        },
        buckets: { training: '' },
        trainingParams: { gpu: 'k80', steps: '500' }
      }
      console.log(config)
      assert.deepEqual(config, expected)
      done()
    })
    // instance_id:
    process.nextTick(() => {
      io.send(keys.enter)
    })
    // username:
    process.nextTick(() => {
      io.send(keys.enter)
    })
    // password:
    process.nextTick(() => {
      io.send(keys.enter)
    })
    // url:
    process.nextTick(() => {
      io.send(keys.enter)
    })
    // access_key_id:
    process.nextTick(() => {
      io.send(keys.enter)
    })
    // secret_access_key:
    process.nextTick(() => {
      io.send(keys.enter)
    })
    // region: (us-geo)
    process.nextTick(() => {
      io.send(keys.enter)
    })
    // Is this ok? (yes)
    process.nextTick(() => {
      io.send(keys.enter)
    })
  })
})
