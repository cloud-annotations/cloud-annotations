const assert = require('assert')
const stdin = require('mock-stdin').stdin
const rewire = require('rewire')
const sinon = require('sinon')
const picker = rewire('./../../src/utils/picker')

describe('picker', () => {
  const prompt = 'pick an item: '
  const shortList = ['item 1', 'item 2', 'item 3']
  const longList = ['item 1', 'item 2', 'item 3', 'item 4', 'item 5', 'item 6']

  const keys = {
    up: '\x1B\x5B\x41',
    down: '\x1B\x5B\x42',
    enter: '\x0D',
    space: '\x20'
  }

  let io = null
  beforeEach(() => (io = stdin()))
  afterEach(() => io.restore())

  it('short non-zero default index', () => {
    const promise = picker(prompt, shortList, { default: 1 }).then(res => {
      assert.equal(res, shortList[1])
    })
    process.nextTick(() => {
      io.send(keys.enter)
    })
    return promise
  })

  it('short negative index', () => {
    const promise = picker(prompt, shortList).then(res => {
      assert.equal(res, shortList[0])
    })
    process.nextTick(() => {
      io.send(keys.up)
      io.send(keys.enter)
    })
    return promise
  })

  it('short overflow index', () => {
    const promise = picker(prompt, shortList).then(res => {
      assert.equal(res, shortList[shortList.length - 1])
    })
    process.nextTick(() => {
      io.send(keys.down)
      io.send(keys.down)
      io.send(keys.down)
      io.send(keys.down)
      io.send(keys.down)
      io.send(keys.enter)
    })
    return promise
  })

  it('long non-zero default index', () => {
    const promise = picker(prompt, longList, {
      default: 5,
      windowSize: 4
    }).then(res => {
      assert.equal(res, longList[5])
    })
    process.nextTick(() => {
      io.send(keys.enter)
    })
    return promise
  })

  it('long negative index', () => {
    const promise = picker(prompt, longList, { windowSize: 4 }).then(res => {
      assert.equal(res, longList[0])
    })
    process.nextTick(() => {
      io.send(keys.up)
      io.send(keys.enter)
    })
    return promise
  })

  it('long overflow index', () => {
    const promise = picker(prompt, longList).then(res => {
      assert.equal(res, longList[longList.length - 1])
    })
    process.nextTick(() => {
      io.send(keys.down)
      io.send(keys.down)
      io.send(keys.down)
      io.send(keys.down)
      io.send(keys.down)
      io.send(keys.down)
      io.send(keys.down)
      io.send(keys.down)
      io.send(keys.enter)
    })
    return promise
  })

  it('random key presses', () => {
    const promise = picker(prompt, longList).then(res => {
      assert.equal(res, longList[0])
    })
    process.nextTick(() => {
      io.send('random keys')
      io.send(keys.enter)
    })
    return promise
  })

  it('safe exit', done => {
    const handleExit = picker.__get__('handleExit')
    const exitSpy = sinon.spy(handleExit)
    picker.__set__('handleExit', exitSpy)
    picker(prompt, longList)

    process.once('SIGTERM', () => {
      assert.equal(exitSpy.called, true)
      done()
    })

    process.kill(process.pid, 'SIGTERM')
  })
})
