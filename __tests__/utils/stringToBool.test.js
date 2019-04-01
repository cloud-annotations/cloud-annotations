const assert = require('assert')
const stringToBool = require('./../../src/utils/stringToBool')

describe('stringToBool', () => {
  it('yes is yes', () => {
    assert.equal(stringToBool('yes'), true)
    assert.equal(stringToBool('yEs'), true)
    assert.equal(stringToBool('Yes'), true)
    assert.equal(stringToBool('Y'), true)
    assert.equal(stringToBool('y'), true)
  })

  it('no means no', () => {
    assert.equal(stringToBool('n'), false)
    assert.equal(stringToBool('no'), false)
    assert.equal(stringToBool('N'), false)
    assert.equal(stringToBool('NO'), false)
    assert.equal(stringToBool('dashiuh'), false)
    assert.equal(stringToBool(''), false)
  })
})
