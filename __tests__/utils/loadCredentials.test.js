const stdin = require('mock-stdin').stdin
const loadCredentials = require('./../../src/utils/loadCredentials')
const { fill } = require('./../mockCredentials')
const wait = require('./../wait')

describe('loadCredentials', () => {
  let io = null
  beforeEach(() => {
    io = stdin()
  })
  afterEach(() => {
    io.restore()
  })

  it('loads credentials', async () => {
    fill()
    await loadCredentials()
  })

  it('asks questions when no credentials', async () => {
    const promise = loadCredentials()

    const keys = { enter: '\x0D' }

    await wait()
    await wait()
    io.send('instance_id')
    io.send(keys.enter)

    await wait()
    io.send('username')
    io.send(keys.enter)

    await wait()
    io.send('password')
    io.send(keys.enter)

    await wait()
    io.send('url')
    io.send(keys.enter)

    await wait()
    io.send('access_key_id')
    io.send(keys.enter)

    await wait()
    io.send('secret_access_key')
    io.send(keys.enter)

    await wait()
    io.send(keys.enter)

    return promise
  })

  it('re-asks when wrong credentials entered', async () => {
    const promise = loadCredentials()

    const keys = { enter: '\x0D' }

    await wait()
    await wait()
    io.send('x_instance_id')
    io.send(keys.enter)

    await wait()
    io.send('x_username')
    io.send(keys.enter)

    await wait()
    io.send('x_password')
    io.send(keys.enter)

    await wait()
    io.send('x_url')
    io.send(keys.enter)

    await wait()
    io.send('instance_id')
    io.send(keys.enter)

    await wait()
    io.send('username')
    io.send(keys.enter)

    await wait()
    io.send('password')
    io.send(keys.enter)

    await wait()
    io.send('url')
    io.send(keys.enter)

    await wait()
    io.send('x_access_key_id')
    io.send(keys.enter)

    await wait()
    io.send('x_secret_access_key')
    io.send(keys.enter)

    await wait()
    io.send('x_us-geo')
    io.send(keys.enter)

    await wait()
    io.send('access_key_id')
    io.send(keys.enter)

    await wait()
    io.send('secret_access_key')
    io.send(keys.enter)

    await wait()
    io.send('us-geo')
    io.send(keys.enter)

    return promise
  })

  // it('exits when no config exists', async () => {
  //   sinon.stub(process, 'exit')
  //   await loadConfig('__tests__/does-not-exist.yaml')
  //   assert(process.exit.called)
  // })
})
