const decache = require('decache')
const mock = require('./mock')
const assert = require('assert').strict
const sinon = require('sinon')
const index = require('./../src/index')
const fs = require('fs-extra')
const { CREDENTIAL_PATH } = require('./mockCredentials')

beforeEach(() => {
  mock.wml(sinon)
  mock.cos(sinon)
  fs.removeSync(CREDENTIAL_PATH)
})

afterEach(() => {
  sinon.restore()
})

describe('index', () => {
  it('works', () => {
    index()
  })

  it('fails on old node version', async () => {
    sinon.stub(process, 'exit')
    sinon.stub(process, 'version').value('v6.10.0')
    decache('./../src/index')
    require('./../src/index')
    assert(process.exit.called)
  })
})
