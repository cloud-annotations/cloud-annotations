const assert = require('assert')
const optionsParse = require('./../../src/utils/optionsParse')

describe('optionsParse', () => {
  const parser = optionsParse()
  parser.add('training_zip')
  parser.add(['--config', '-c'])
  parser.add([true, 'help', '--help', '-help', '-h'])

  it('complex ops', () => {
    const options = [
      'model.zip',
      '--fake=123',
      '-h',
      '--config',
      'fake-config.yml',
      'garbage'
    ]

    const expected = {
      config: 'fake-config.yml',
      help: true,
      training_zip: 'model.zip'
    }

    const ops = parser.parse(options)
    assert.deepEqual(ops, expected)
  })
})
