const assert = require('assert').strict
const sinon = require('sinon')
const stdin = require('mock-stdin').stdin
const fs = require('fs-extra')
const rewire = require('rewire')
const dump = require('./../../src/commands/dump')
const wait = require('./../wait')
const { fill } = require('./../mockCredentials')

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

  it('fails with no buckets', async () => {
    const dump = rewire('./../../src/commands/dump')
    sinon.stub(process, 'exit')
    const stub = sinon.stub().returns([])
    dump.__set__('listBuckets', stub)
    fill()
    await dump(['--config', '__tests__/config.yaml'])
    assert(process.exit.called)
  })

  it('gracefully throws error', async () => {
    const dump = rewire('./../../src/commands/dump')
    sinon.stub(process, 'exit')
    const stub = sinon.stub().throws('fake error')
    dump.__set__('listBuckets', stub)
    fill()
    await dump(['--config', '__tests__/config.yaml'])
  })

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
