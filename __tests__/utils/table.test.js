const Table = require('./../../src/utils/table')

describe('table', () => {
  it('simple', () => {
    const table = new Table({})
    table.addRow([
      { value: 'really really long title' },
      { value: 'one', width: '5' },
      { value: 'two', width: '5' },
      { value: 'three', width: '5' }
    ])
    console.log(table.toString())
  })

  it('constricted', () => {
    const table = new Table({ width: 30 })
    table.addRow([
      { value: 'really really long title' },
      { value: 'one', width: '5' },
      { value: 'two', width: '5' },
      { value: 'three', width: '5' }
    ])
    console.log(table.toString())
  })
})
