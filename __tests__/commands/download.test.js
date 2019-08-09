const assert = require('assert').strict
const stdin = require('mock-stdin').stdin
const fs = require('fs-extra')
const sinon = require('sinon')
const download = require('./../../src/commands/download')
const wait = require('./../wait')
const { fill } = require('./../mockCredentials')

describe('download', () => {
  const keys = { enter: '\x0D' }

  let io = null
  beforeEach(() => {
    io = stdin()
  })
  afterEach(() => {
    io.restore()
  })

  it('model running', async () => {
    fill()
    const promise = download([
      'model-running',
      '--config',
      '__tests__/config.yaml'
    ])
    await wait()
    await wait()
    io.send('no')
    io.send(keys.enter)
    return promise
  })

  it('model pending watch progress', async () => {
    fill()
    const promise = download([
      'model-pending',
      '--config',
      '__tests__/config.yaml'
    ])
    await wait()
    await wait()
    io.send(keys.enter)
    return promise
  })

  it('model completed', async () => {
    sinon.stub(fs, 'outputFile')
    fill()
    await download(['model-completed', '--config', '__tests__/config.yaml'])
    assert(fs.outputFile.calledWith('./model-completed/dir/object.jpg'))
    assert(fs.outputFile.calledWith('./model-completed/dir/object/object2.jpg'))
    assert(fs.outputFile.neverCalledWith('./dir/object/'))
    assert(fs.outputFile.neverCalledWith('./dir/dir/'))
    
    await download(['model-completed', '--config', '__tests__/config.yaml','--tflite'])
    assert(fs.outputFile.calledWith('./model-completed/dir/object.jpg'))
    assert(fs.outputFile.calledWith('./model-completed/dir/object/object2.jpg'))
    assert(fs.outputFile.neverCalledWith('./dir/object/'))
    assert(fs.outputFile.neverCalledWith('./dir/dir/'))
    
    await download(['model-completed', '--config', '__tests__/config.yaml','--coreml'])
    assert(fs.outputFile.calledWith('./model-completed/dir/object.jpg'))
    assert(fs.outputFile.calledWith('./model-completed/dir/object/object2.jpg'))
    assert(fs.outputFile.neverCalledWith('./dir/object/'))
    assert(fs.outputFile.neverCalledWith('./dir/dir/'))
    
    await download(['model-completed', '--config', '__tests__/config.yaml','--tfjs'])
    assert(fs.outputFile.calledWith('./model-completed/dir/object.jpg'))
    assert(fs.outputFile.calledWith('./model-completed/dir/object/object2.jpg'))
    assert(fs.outputFile.neverCalledWith('./dir/object/'))
    assert(fs.outputFile.neverCalledWith('./dir/dir/'))
  })

  it('model error', async () => {
    sinon.stub(process, 'exit')
    fill()
    await download(['model-error', '--config', '__tests__/config.yaml'])
    assert(process.exit.called)
  })

  it('model failed', async () => {
    sinon.stub(process, 'exit')
    fill()
    await download(['model-failed', '--config', '__tests__/config.yaml'])
    assert(process.exit.called)
  })

  it('model canceled', async () => {
    sinon.stub(process, 'exit')
    fill()
    await download(['model-canceled', '--config', '__tests__/config.yaml'])
    assert(process.exit.called)
  })

  it('displays usage', async () => {
    sinon.stub(process, 'exit')
    await download([])
  })

  it('displays help', async () => {
    sinon.stub(process, 'exit')
    await download(['--help'])
  })
})
