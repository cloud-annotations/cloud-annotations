const sinon = require('sinon')
const dump = require('./../../src/commands/dump')

describe('dump', () => {
  it('displays help', async () => {
    sinon.stub(process, 'exit')
    await dump(['--help'])
  })
})
