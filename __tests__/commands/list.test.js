const sinon = require('sinon')
const list = require('./../../src/commands/list')

describe('list', () => {
  it('dry run', async () => {
    await list(['--config', '__tests__/config.yaml'])
  })

  it('displays help', async () => {
    sinon.stub(process, 'exit')
    await list(['--help'])
  })
})
