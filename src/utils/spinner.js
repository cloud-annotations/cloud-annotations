const cursorToStart = require('./../utils/cursorToStart')
const clearLine = require('./../utils/clearLine')

const spinner = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'.split('')

module.exports = class Spinner {
  constructor() {
    this.delay = 60
    this.message = ''
    this.current = 0
    this.id = null
  }

  setMessage(message) {
    this.message = message
  }

  start() {
    this.current = 0
    this.render()
  }

  stop() {
    if (this.id) {
      clearTimeout(this.id)
      this.id = null
    }
    clearLine()
    cursorToStart()
  }

  render() {
    if (this.id) {
      clearTimeout(this.id)
    }
    const line = `${spinner[this.current]} ${this.message}`

    clearLine()
    cursorToStart()
    process.stdout.write(line)

    this.current = ++this.current % spinner.length
    this.id = setTimeout(() => this.render(), this.delay)
  }
}
