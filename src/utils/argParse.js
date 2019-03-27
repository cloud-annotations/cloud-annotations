module.exports = () => {
  const args = process.argv.slice(2, process.argv.length)
  var commands = {}
  return {
    add: function(command, fn) {
      commands[command] = fn
    },
    parse: function() {
      if (!args[0] || args[0].startsWith('-')) {
        commands['']()
      } else if (commands[args[0]]) {
        commands[args[0]](args.slice(1, args.length))
      }
    }
  }
}
