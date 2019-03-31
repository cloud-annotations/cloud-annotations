const Spinner = require('./../src/utils/spinner')

describe('spinner', () => {
  it('stop immediate', () => {
    const spinner = new Spinner()
    spinner.setMessage('Spinning...')
    spinner.stop()
  })

  it('stop after spinning', done => {
    const spinner = new Spinner()
    spinner.setMessage('Spinning...')
    spinner.start()
    setTimeout(() => {
      spinner.stop()
      done()
    }, 120)
  })
})
