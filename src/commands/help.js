const { dim } = require('chalk')
const { version } = require('./../package.json')

// TODO: Make this dynamic
module.exports = options => {
  const title = `C${dim('loud')} A${dim('nnotations')} CLI`
  console.log(`┌───────────────────────┐
│ ${title} │
│ version ${version}         │
└───────────────────────┘

Usage: cacli <command>

where <command> is one of:
  init         Interactively create a config.yaml file
  train        Start a training run
  logs         Monitor the logs of a training run
  progress     Monitor the progress of a training run
  list         List all training runs
  download     Download a trained model

cacli <cmd> -h     quick help on <cmd>
  `)
}
