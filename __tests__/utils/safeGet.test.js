const assert = require('assert')
const safeGet = require('./../../src/utils/safeGet')

describe('safeGet', () => {
  const nullObject = undefined
  const nonNullObject = { realParam: 'real' }
  const defaultParam = 'i am fake'

  it('safely gets from a undefined object', () => {
    const fakeParam = safeGet(() => nullObject.fakeParam)
    assert.equal(fakeParam, null)
  })

  it('safely gets from a undefined object with default', () => {
    const fakeParam = safeGet(() => nullObject.fakeParam, defaultParam)
    assert.equal(fakeParam, defaultParam)
  })

  it('safely gets from a defined object', () => {
    const fakeParam = safeGet(() => nonNullObject.realParam)
    assert.equal(fakeParam, 'real')
  })

  it('safely gets from a defined object with default', () => {
    const fakeParam = safeGet(() => nonNullObject.realParam, defaultParam)
    assert.equal(fakeParam, 'real')
  })
})
