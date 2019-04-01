const sinon = require('sinon')
const assert = require('assert')
const argParse = require('./../../src/utils/argParse')

describe('argParse', () => {
  const spy1 = sinon.spy()
  const spy2 = sinon.spy()
  const args = argParse()
  args.add('', spy1)
  args.add('command', spy2)

  beforeEach(() => {
    spy1.resetHistory()
    spy2.resetHistory()
  })

  it('regular command', () => {
    const stub = sinon.stub(process, 'argv')
    process.argv = ['/Users/xxx/node', '/Users/xxx/cacli', 'command']
    args.parse()
    assert(spy2.called)
    stub.restore()
  })

  it('empty command', () => {
    const stub = sinon.stub(process, 'argv')
    process.argv = ['/Users/xxx/node', '/Users/xxx/cacli']
    args.parse()
    assert(spy1.called)
    stub.restore()
  })

  it('empty command with flag', () => {
    const stub = sinon.stub(process, 'argv')
    process.argv = ['/Users/xxx/node', '/Users/xxx/cacli', '--help']
    args.parse()
    assert(spy1.called)
    stub.restore()
  })

  it('fake command', () => {
    const stub = sinon.stub(process, 'argv')
    process.argv = ['/Users/xxx/node', '/Users/xxx/cacli', 'fake']
    args.parse()
    assert(!spy1.called)
    assert(!spy2.called)
    stub.restore()
  })
})
