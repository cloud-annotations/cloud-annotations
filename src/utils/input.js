const readline = require('readline')
const { eraseLines } = require('ansi-escapes')

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

    let charCount = 0
    rl.input.on('keypress', (_, key) => {
      if (key.name === 'tab' && charCount === 0) {
        process.stdout.write(eraseLines(1))
        rl.setPrompt(question)
        rl.prompt()
      } else if (key.name === 'backspace' && charCount === 0) {
        process.stdout.write(eraseLines(1))
        rl.setPrompt(prompt)
        rl.prompt()
      } else if (key.name === 'backspace') {
        charCount--
      } else {
        charCount++
      }
    })

    rl.question(question, answer => {
      const actualAnswer = answer.toString().trim() || defaultVal || ''
      process.stdout.write(eraseLines(2))
      console.log(prompt + actualAnswer)
      resolve(actualAnswer)
      rl.close()
    })
  })
