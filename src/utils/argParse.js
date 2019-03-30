module.exports = () => {
  var commands = {}
  return {
    add: (command, fn) => {
      commands[command] = fn
    },
    parse: () => {
      const args = process.argv.slice(2, process.argv.length)
      if (!args[0] || args[0].startsWith('-')) {
        commands['']()
      } else if (commands[args[0]]) {
        commands[args[0]](args.slice(1, args.length))
      }
    }
  }
}
