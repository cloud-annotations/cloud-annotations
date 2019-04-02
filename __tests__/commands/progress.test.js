const sinon = require('sinon')
const progress = require('./../../src/commands/progress')

describe('progress', () => {
  it('displays help', async () => {
    sinon.stub(process, 'exit')
    await progress(['--help'])
    process.exit.restore()
  })
})
