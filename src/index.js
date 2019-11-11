if (process.version.match(/v(\d+)\./)[1] < 10) {
  console.log(
    `Node version 10 or later is required. Not satisfied by current version ${process.version}.`
  )
  return process.exit(1)
}

const { yellow } = require('chalk')
if (!process.stdout.isTTY) {
  console.log(
    `${yellow(
      'warning'
    )} Not a true terminal, some inputs might not work properly.`
  )
  console.log()
}

const argParse = require('./utils/argParse')
const help = require('./commands/help')
const init = require('./commands/init')
const login = require('./commands/login')
const logout = require('./commands/logout')
const train = require('./commands/train')
const list = require('./commands/list')
const logs = require('./commands/logs')
const tensorboard = require('./commands/tensorboard')
const progress = require('./commands/progress')
const download = require('./commands/download')
const bootstrap = require('./commands/bootstrap')
const dump = require('./commands/dump')

module.exports = () => {
  const args = argParse()

  args.add('', help)
  args.add('help', help)
  args.add('init', init)
  args.add('config', init)
  args.add('login', login)
  args.add('logout', logout)
  args.add('train', train)
  args.add('run', train)
  args.add('list', list)
  args.add('logs', logs)
  args.add('log', logs)
  args.add('tensorboard', tensorboard)
  args.add('progress', progress)
  args.add('download', download)

  args.add('bootstrap', bootstrap)
  args.add('export', dump)

  args.parse()
}
