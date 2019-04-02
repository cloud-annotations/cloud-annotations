const mock = require('./mock')
const sinon = require('sinon')

beforeEach(() => {
  mock.wml(sinon)
  mock.cos(sinon)
})

afterEach(() => {
  sinon.restore()
})
