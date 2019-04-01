const assert = require('assert')
const rewire = require('rewire')
const ProgressBar = rewire('./../../src/utils/progressBar')

describe('progress bar', () => {
  it('fills', () => {
    const progressBar = new ProgressBar(10)
    for (let i = 0; i < 11; i++) {
      progressBar.applyRateInfo(1)
      progressBar.update(i)
    }
    progressBar.stop()
  })

  it('rate buffer', () => {
    const progressBar = new ProgressBar(10)
    for (let i = 0; i < 100; i++) {
      progressBar.applyRateInfo(10)
    }
    for (let i = 0; i < 100; i++) {
      progressBar.applyRateInfo(50)
    }
    assert.equal(progressBar.getAvgRate(), 50)
    progressBar.stop()
  })

  it('no rate', () => {
    const [unit, eta] = ProgressBar.__get__('getRateInfo')(0, 1, 0)
    assert.equal(unit, '')
    assert.equal(eta, '???')
  })

  it('seconds are seconds', () => {
    const [unit, eta] = ProgressBar.__get__('getRateInfo')(1, 1, 0)
    assert.equal(unit, 'sec')
    assert.equal(eta, 1)
  })

  it('minutes are minutes', () => {
    const [unit, eta] = ProgressBar.__get__('getRateInfo')(1 / 60, 1, 0)
    assert.equal(unit, 'mins')
    assert.equal(eta, 1)
  })

  it('hours are hours', () => {
    const [unit, eta] = ProgressBar.__get__('getRateInfo')(1 / (60 * 60), 1, 0)
    assert.equal(unit, 'hrs')
    assert.equal(eta, 1)
  })
})
