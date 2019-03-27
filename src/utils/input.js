const readline = require('readline')

module.exports = (prompt, defaultVal) =>
  new Promise((resolve, _) => {
    const question = prompt + (defaultVal ? `(${defaultVal}) ` : '')

    const input = process.stdin
    const output = process.stdout
    rl = readline.createInterface({
      terminal: true,
      input,
      output
    })

    rl.question(question, answer => {
      resolve(answer.toString().trim() || defaultVal || '')
      rl.close()
    })
  })
