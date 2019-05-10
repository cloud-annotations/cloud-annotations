const stdin = require('mock-stdin').stdin
const sinon = require('sinon')
const bootstrap = require('./../../src/commands/bootstrap')
const wait = require('./../wait')
const { fill } = require('./../mockCredentials')

describe('bootstrap', () => {
  const keys = { enter: '\x0D' }

  let io = null
  beforeEach(() => {
    io = stdin()
  })
  afterEach(() => {
    io.restore()
  })

  it('bootstraps', async () => {
    fill()
    const promise = bootstrap([
      '__tests__',
      '--config',
      '__tests__/config.yaml'
    ])
    await wait()
    await wait()
    io.send('fake-name')
    io.send(keys.enter)
    return promise
  })

  it('displays usage', async () => {
    sinon.stub(process, 'exit')
    await bootstrap([])
  })

  it('displays help', async () => {
    sinon.stub(process, 'exit')
    await bootstrap(['--help'])
  })
})
