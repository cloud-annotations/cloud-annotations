const assert = require('assert').strict
const chalk = require('chalk')
const stringLength = require('./../../src/utils/stringLength')

describe('stringLength', () => {
  const basicString = 'i am a basic string'

  it('basic', () => {
    assert.equal(basicString.length, stringLength(basicString))
  })

  it('emoji', () => {
    assert.equal(basicString.length + 1, stringLength(basicString + '👻'))
  })

  it('colors', () => {
    assert.equal(basicString.length, stringLength(chalk.green(basicString)))
  })
})
