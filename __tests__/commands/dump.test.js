const assert = require('assert').strict
const sinon = require('sinon')
const stdin = require('mock-stdin').stdin
const fs = require('fs-extra')
const proxyquire = require('proxyquire')
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

  it('exports create ml', async () => {
    const obj = {
      version: '1.0',
      type: 'localization',
      labels: ['Mountain Dew', 'Coke', 'Pepsi'],
      annotations: {
        'fake.jpg': [
          {
            x: 0.7255949630314233,
            x2: 0.9695875693160814,
            y: 0.5820120073891626,
            y2: 1,
            label: 'Pepsi'
          }
        ]
      }
    }

    sinon.stub(fs, 'outputFile')
    const stub = sinon.stub(fs, 'readFileSync')
    stub
      .withArgs('exported_buckets/bucket/_annotations.json', 'utf8')
      .returns(JSON.stringify(obj))
    stub.callThrough()

    const sizeStub = sinon.stub().returns({ width: 50, height: 50 })
    const dump = proxyquire('./../../src/commands/dump', {
      'image-size': sizeStub
    })

    fill()
    const promise = dump(['--config', '__tests__/config.yaml', '--create-ml'])
    await wait()
    await wait()
    io.send(keys.enter)
    await promise
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
