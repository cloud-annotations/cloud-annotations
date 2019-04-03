const mock = require('./mock')
const sinon = require('sinon')
const index = require('./../src/index')

beforeEach(() => {
  mock.wml(sinon)
  mock.cos(sinon)
})

afterEach(() => {
  sinon.restore()
})

describe('index', () => {
  it('works', () => {
    index()
  })
})
