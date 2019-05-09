const assert = require('assert').strict
const sinon = require('sinon')
const stdin = require('mock-stdin').stdin
const fs = require('fs-extra')
const dump = require('./../../src/commands/dump')
const wait = require('./../wait')
const { fill, noBuckets } = require('./../mockCredentials')

describe('dump', () => {
  const keys = {
    up: '\x1B\x5B\x41',
    down: '\x1B\x5B\x42',
    enter: '\x0D',
    space: '\x20'
  }

  let io = null
  beforeEach(() => {
    io = stdin()
  })
  afterEach(() => {
    io.restore()
  })

  it('dumps', async () => {
    sinon.stub(fs, 'outputFile')
    fill()
    const promise = dump(['--config', '__tests__/config.yaml'])
    await wait()
    await wait()
    io.send(keys.enter)
    await promise
    assert(fs.outputFile.calledWith('./exported_buckets/bucket/dir/object.jpg'))
    assert(
      fs.outputFile.calledWith(
        './exported_buckets/bucket/dir/object/object2.jpg'
      )
    )
    assert(
      fs.outputFile.neverCalledWith('./exported_buckets/bucket/dir/object/')
    )
    assert(fs.outputFile.neverCalledWith('./exported_buckets/bucket/dir/dir/'))
  })

  // it('fails with bad config', async () => {
  //   sinon.stub(process, 'exit')
  //   await dump(['--config', '__tests__/config.1.yaml'])
  //   assert(process.exit.called)
  // })

  // it('fails with no buckets', async () => {
  //   sinon.stub(process, 'exit')
  //   noBuckets()
  //   await dump(['--config', '__tests__/config.2.yaml'])
  //   assert(process.exit.called)
  // })

  it('fails with out of region bucket', async () => {
    sinon.stub(process, 'exit')
    fill()
    const promise = dump(['--config', '__tests__/config.yaml'])
    await wait()
    await wait()
    io.send(keys.down)
    io.send(keys.enter)
    await promise
    assert(process.exit.called)
  })

  it('displays help', async () => {
    sinon.stub(process, 'exit')
    await dump(['--help'])
  })
})
