const assert = require('assert').strict
const stdin = require('mock-stdin').stdin
const input = require('./../../src/utils/input')
const wait = require('./../wait')

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

  it('no default + user input', async () => {
    const promise = input(prompt).then(res => {
      assert.equal(res, userInput)
    })

    await wait()
    io.send(userInput)
    io.send(keys.enter)

    return promise
  })

  it('no default + no user input', async () => {
    const promise = input(prompt).then(res => {
      assert.equal(res, '')
    })
    await wait()
    io.send(keys.enter)

    return promise
  })

  it('default + user input', async () => {
    const promise = input(prompt, defaultResponce).then(res => {
      assert.equal(res, userInput)
    })
    await wait()
    io.send(userInput)
    io.send(keys.enter)

    return promise
  })

  it('default + no user input', async () => {
    const promise = input(prompt, defaultResponce).then(res => {
      assert.equal(res, defaultResponce)
    })
    await wait()
    io.send(keys.enter)

    return promise
  })
})
