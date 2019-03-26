const stringLength = require('./stringLength')

module.exports = class Table {
  constructor({ columnBuffer, width, maxWidth }) {
    this._columnBuffer = columnBuffer
    this._width = Math.min(width, maxWidth)
    this._table = ''
  }

  addRow(row) {
    this._table += ' '
    const flexColumns = row.filter(({ width }) => !width)

    const sparePadding = row.reduce((acc, column, i) => {
      const { value, width } = column
      if (width) {
        acc -= width
      } else {
        acc -= stringLength(value)
      }
      if (i < row.length - 1) {
        acc -= this._columnBuffer
      }
      return acc
    }, this._width - 2)

    row.forEach((column, i) => {
      const { value, width, align } = column
      if (!column.colorFunc) {
        column.colorFunc = input => input
      }
      const [pad, trim] = (() => {
        if (width) {
          const pad = width - stringLength(value)
          return [Math.max(pad, 0), Math.min(pad, 0)]
        } else {
          const pad = sparePadding / flexColumns.length
          return [Math.max(pad, 0), Math.min(pad, 0)]
        }
      })()
      const val = (() => {
        if (trim < 0) {
          return value.slice(0, trim - 3) + '...'
        } else {
          return value
        }
      })()
      switch (align) {
        case 'right':
          this._table += column.colorFunc(`${' '.repeat(pad)}${val}`)
          break
        case 'center':
          const half = pad / 2
          const mod = pad % 2
          this._table += column.colorFunc(
            `${' '.repeat(half)}${val}${' '.repeat(half + mod)}`
          )
          break
        default:
          this._table += column.colorFunc(`${val}${' '.repeat(pad)}`)
          break
      }
      if (i < row.length - 1) {
        this._table += ' '.repeat(this._columnBuffer)
      }
    })
    this._table += '\n'
  }

  toString() {
    return `${'─'.repeat(this._width)}\n${this._table}${'─'.repeat(
      this._width
    )}`
  }
}
