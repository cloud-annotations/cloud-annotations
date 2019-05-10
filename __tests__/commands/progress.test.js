const sinon = require('sinon')
const progress = require('./../../src/commands/progress')
const { fill } = require('./../mockCredentials')

describe('progress', () => {
  it('gets progress from bucket', async () => {
    sinon.stub(process, 'exit')
    fill()
    await progress(['model-completed', '--config', '__tests__/config.yaml'])
  })

  it('gets streamed progress', async () => {
    fill()
    await progress(['model-running', '--config', '__tests__/config.yaml'])
  })

  it('fails with training error', async () => {
    sinon.stub(process, 'exit')
    fill()
    await progress(['training-failed', '--config', '__tests__/config.yaml'])
  })

  it('fails with conversion error', async () => {
    sinon.stub(process, 'exit')
    fill()
    await progress(['conversion-failed', '--config', '__tests__/config.yaml'])
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
