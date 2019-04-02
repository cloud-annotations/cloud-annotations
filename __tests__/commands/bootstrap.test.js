const sinon = require('sinon')
const bootstrap = require('./../../src/commands/bootstrap')

describe('bootstrap', () => {
  it('displays help', async () => {
    sinon.stub(process, 'exit')
    await bootstrap(['--help'])
    process.exit.restore()
  })
})
