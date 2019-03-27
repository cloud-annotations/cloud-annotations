const readline = require('readline')
const { supportsColor } = require('chalk')

module.exports = () => {
  if (!supportsColor) {
    process.stdout.write('\r')
    return
  }

  readline.cursorTo(process.stdout, 0)
}
