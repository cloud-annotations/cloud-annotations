const sinon = require('sinon')
const download = require('./../../src/commands/download')

describe('download', () => {
  it('displays help', async () => {
    sinon.stub(process, 'exit')
    await download(['--help'])
    process.exit.restore()
  })
})
