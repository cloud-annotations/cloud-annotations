const tty = require('tty')
const readline = require('readline')
const { supportsColor } = require('chalk')

module.exports = () => {
  if (!supportsColor) {
    if (process.stdout instanceof tty.WriteStream) {
      if (process.stdout.columns > 0) {
        process.stdout.write(`\r${' '.repeat(process.stdout.columns - 1)}`)
      }
      process.stdout.write(`\r`)
    }
    return
  }

  readline.clearLine(process.stdout, 0)
  readline.cursorTo(process.stdout, 0)
}
