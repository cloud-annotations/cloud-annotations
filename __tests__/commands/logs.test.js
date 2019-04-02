const sinon = require('sinon')
const logs = require('./../../src/commands/logs')

describe('logs', () => {
  it('gets logs from bucket', async () => {
    await logs(['model-completed', '--config', '__tests__/config.yaml'])
  })

  it('gets streamed logs', async () => {
    await logs(['model-running', '--config', '__tests__/config.yaml'])
  })

  it('displays usage', async () => {
    sinon.stub(process, 'exit')
    await logs([])
    process.exit.restore()
  })

  it('displays help', async () => {
    sinon.stub(process, 'exit')
    await logs(['--help'])
    process.exit.restore()
  })
})
