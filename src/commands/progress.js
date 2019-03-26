const { green } = require('chalk')
const WML = require('./../api/wml')
const loadConfig = require('./../utils/loadConfig')
const safeGet = require('./../utils/safeGet')
const optionsParse = require('./../utils/optionsParse')
const ProgressBar = require('./../utils/progressBar')
const Spinner = require('./../utils/spinner')

const getMatches = (string, regex) => {
  let m
  const matches = {}
  while ((m = regex.exec(string)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++
    }
    m.forEach((match, groupIndex) => {
      const group = matches[groupIndex] || []
      group.push(match)
      matches[groupIndex] = group
    })
  }
  return matches
}

module.exports = async (options, importedConfig) => {
  const parser = optionsParse()
  parser.add('model_id')
  parser.add([true, 'help', '--help', '-h'])
  const ops = parser.parse(options)

  if (ops.help) {
    console.log('cacli progress <model_id>')
    process.exit()
  }

  const config = importedConfig || loadConfig()

  if (!ops.model_id) {
    console.log('No Model ID provided')
    console.log('Usage: cacli progress <model_id>')
    process.exit(1)
  }

  const wml = new WML(config)

  const run = await wml.getTrainingRun(ops.model_id)

  const status = run.entity.status.state
  switch (status) {
    case 'completed':
    case 'error':
    case 'failed':
    case 'canceled':
      console.log('✨ Done.')
      process.exit()
  }

  const ws = await wml.createMonitorSocket(ops.model_id)

  ws.on('open', () => {})

  const spinner = new Spinner()
  ws.on('close', () => {
    spinner.stop()
    console.log(`${green('success')} Model files saved to bucket.`)
    console.log('✨ Done.')
  })

  spinner.setMessage('Preparing to train (this may take a while)... ')
  spinner.start()

  const totalStepsRegex = /--num-train-steps=(\d*)/gm
  const trainingCommand = run.entity.model_definition.execution.command
  const totalSteps = totalStepsRegex.exec(trainingCommand)[1]
  const progressBar = new ProgressBar(totalSteps)

  ws.on('message', json => {
    const message = safeGet(() => JSON.parse(json).status.message, false)
    if (message && message.length > 0) {
      const objectDetectionStepRegex = /tensorflow:loss = [\d.]*, step = (\d*)/gm
      const classificationStepRegex = /Step (\d*): Train accuracy/gm
      const rateRegex = /tensorflow:global_step\/sec: ([\d.]*)/gm
      const successRegex = /training success/gm

      const steps =
        getMatches(message, objectDetectionStepRegex)[1] ||
        getMatches(message, classificationStepRegex)[1] ||
        []

      const rates = getMatches(message, rateRegex)[1] || []
      rates.forEach(rate => {
        progressBar.applyRateInfo(rate)
      })

      if (steps.length > 0) {
        spinner.stop()
        if (!progressBar.started) {
          console.log(`${green('success')} Training in progress.`)
        }
        const largestStep = Math.max(steps)
        progressBar.update(largestStep)
      }

      if (getMatches(message, successRegex)[0]) {
        progressBar.stop()
        console.log(`${green('success')} Training complete.`)
        spinner.setMessage('Generating model files... ')
        spinner.start()
      }
    }
  })
}
