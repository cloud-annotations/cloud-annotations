const sinon = require('sinon')
const logs = require('./../../src/commands/logs')
const { fill } = require('./../mockCredentials')

describe('logs', () => {
  it('gets logs from bucket', async () => {
    fill()
    await logs(['model-completed', '--config', '__tests__/config.yaml'])
  })

  it('gets streamed logs', async () => {
    fill()
    await logs(['model-running', '--config', '__tests__/config.yaml'])
  })

  it('displays usage', async () => {
    sinon.stub(process, 'exit')
    await logs([])
  })

  it('displays help', async () => {
    sinon.stub(process, 'exit')
    await logs(['--help'])
  })
})
