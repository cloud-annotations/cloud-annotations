const sinon = require('sinon')
const list = require('./../../src/commands/list')
const { fill } = require('./../mockCredentials')

describe('list', () => {
  it('dry run', async () => {
    fill()
    await list(['--config', '__tests__/config.yaml'])
  })

  it('displays help', async () => {
    sinon.stub(process, 'exit')
    await list(['--help'])
  })
})
