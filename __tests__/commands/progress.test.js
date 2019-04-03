const sinon = require('sinon')
const progress = require('./../../src/commands/progress')

describe('progress', () => {
  it('gets progress from bucket', async () => {
    sinon.stub(process, 'exit')
    await progress(['model-completed', '--config', '__tests__/config.yaml'])
  })

  it('gets streamed progress', async () => {
    await progress(['model-running', '--config', '__tests__/config.yaml'])
  })

  it('displays usage', async () => {
    sinon.stub(process, 'exit')
    await progress([])
  })

  it('displays help', async () => {
    sinon.stub(process, 'exit')
    await progress(['--help'])
  })
})
