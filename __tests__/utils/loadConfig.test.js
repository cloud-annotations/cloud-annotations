const sinon = require('sinon')
const assert = require('assert').strict
const loadConfig = require('./../../src/utils/loadConfig')

describe('loadConfig', () => {
  it('loads default config', async () => {
    // This looks for the config in the root directory which is git ignored,
    // so this will try to exit in travis ci so we stub process.exit.
    sinon.stub(process, 'exit')
    await loadConfig()
  })

  it('loads config', async () => {
    const config = await loadConfig('__tests__/config.yaml')
    assert.equal(config.name, 'fake-config')
  })

  it('exits when no config exists', async () => {
    sinon.stub(process, 'exit')
    await loadConfig('__tests__/does-not-exist.yaml')
    assert(process.exit.called)
  })
})
