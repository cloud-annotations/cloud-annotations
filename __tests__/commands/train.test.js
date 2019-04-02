const sinon = require('sinon')
const train = require('./../../src/commands/train')

describe('train', () => {
  it('displays help', async () => {
    sinon.stub(process, 'exit')
    await train(['--help'])
    process.exit.restore()
  })
})
