const { cursorTo, eraseLine } = require('ansi-escapes')

const bar = ['#', '-']

const MAX_RATE_BUFFER = 20

const getRateInfo = (rate, total, current) => {
  let unit = ''
  let eta = '???'
  if (rate > 0) {
    unit = 'sec'
    eta = (1 / rate) * (total - current)
    if (eta >= 60) {
      unit = 'mins'
      eta = eta / 60
      if (eta >= 60) {
        unit = 'hrs'
        eta = eta / 60
      }
    }
    eta = Math.round(eta)
  }
  return [unit, eta]
}

module.exports = class ProgressBar {
  constructor(total) {
    this.total = total
    this.current = 0
    this.rateAcc = []
    this.started = false
  }

  stop() {
    this.started = false
    process.stdout.write(eraseLine)
    process.stdout.write(cursorTo(0))
  }

  applyRateInfo(rate) {
    this.rateAcc.push(rate)
    if (this.rateAcc.length > MAX_RATE_BUFFER) {
      this.rateAcc.shift()
    }
  }

  getAvgRate() {
    return (
      this.rateAcc.reduce((acc, item) => {
        acc += parseFloat(item)
        return acc
      }, 0) / this.rateAcc.length
    )
  }

  update(current) {
    this.current = current
    this.started = true

    const rate = this.getAvgRate()

    const [unit, eta] = getRateInfo(rate, this.total, this.current)

    const percent = Math.min(Math.max(this.current / this.total), 1)
    const progress = ` ${this.current}/${this.total} | ETA: ${eta} ${unit}`

    const width = Math.max(0, process.stdout.columns - progress.length - 3)

    const filledLength = Math.round(width * percent)
    const filled = bar[0].repeat(filledLength)
    const empty = bar[1].repeat(width - filledLength)

    process.stdout.write(eraseLine)
    process.stdout.write(cursorTo(0))
    process.stdout.write(`[${filled}${empty}]${progress}`)
  }
}
