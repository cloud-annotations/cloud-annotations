const assert = require('assert')
const stdin = require('mock-stdin').stdin
const input = require('./../../src/utils/input')

describe('input', () => {
  const userInput = 'Hello'
  const defaultResponce = 'default'
  const prompt = 'fake message: '

  const keys = {
    up: '\x1B\x5B\x41',
    down: '\x1B\x5B\x42',
    enter: '\x0D',
    space: '\x20'
  }

  let io = null
  beforeEach(() => (io = stdin()))
  afterEach(() => io.restore())

  it('no default + user input', () => {
    const promise = input(prompt).then(res => {
      assert.equal(res, userInput)
    })

    process.nextTick(() => {
      io.send(userInput)
      io.send(keys.enter)
    })
    return promise
  })

  it('no default + no user input', () => {
    const promise = input(prompt).then(res => {
      assert.equal(res, '')
    })
    process.nextTick(() => {
      io.send(keys.enter)
    })
    return promise
  })

  it('default + user input', () => {
    const promise = input(prompt, defaultResponce).then(res => {
      assert.equal(res, userInput)
    })
    process.nextTick(() => {
      io.send(userInput)
      io.send(keys.enter)
    })
    return promise
  })

  it('default + no user input', () => {
    const promise = input(prompt, defaultResponce).then(res => {
      assert.equal(res, defaultResponce)
    })
    process.nextTick(() => {
      io.send(keys.enter)
    })
    return promise
  })
})
