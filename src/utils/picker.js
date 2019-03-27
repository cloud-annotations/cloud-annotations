const readline = require('readline')
const { cyan } = require('chalk')
const MuteStream = require('mute-stream')
const { eraseLines, cursorHide, cursorShow } = require('ansi-escapes')

const renderItems = (items, delegate, index) => {
  let pointer = (delegate.windowSize - 1) / 2
  if (index < pointer) {
    for (let i = 0; i < delegate.windowSize; i++) {
      process.stdout.write(delegate.renderItem(items[i], i === index))
      if (i < delegate.windowSize - 1) {
        process.stdout.write('\n')
      }
    }
    return
  }
  if (index >= items.length - pointer) {
    for (let i = items.length - delegate.windowSize; i < items.length; i++) {
      process.stdout.write(delegate.renderItem(items[i], i === index))
      if (i < items.length - 1) {
        process.stdout.write('\n')
      }
    }
    return
  }
  const xxx = index - pointer
  for (let i = xxx; i < delegate.windowSize + xxx; i++) {
    process.stdout.write(delegate.renderItem(items[i], i - xxx === pointer))
    if (i < delegate.windowSize + xxx - 1) {
      process.stdout.write('\n')
    }
  }
}

const handleExit = () => {
  console.log(cursorShow)
}

module.exports = async (prompt, items, delegate = {}) => {
  delegate.windowSize = delegate.windowSize || 11
  let index = delegate.default || 0
  delegate.renderItem =
    delegate.renderItem ||
    ((item, selected) => {
      if (selected) {
        return cyan.bold(`❯ ${item}`)
      }
      return `  ${item}`
    })
  delegate.windowSize = Math.min(delegate.windowSize, items.length)

  console.log(prompt)
  process.on('exit', handleExit)

  const input = process.stdin
  const output = new MuteStream()
  output.pipe(process.stdout)
  rl = readline.createInterface({
    terminal: true,
    input,
    output
  })

  renderItems(items, delegate, index)

  process.stdout.write(cursorHide)
  rl.output.mute()

  const answer = await new Promise((resolve, _) => {
    rl.input.on('keypress', (_, key) => {
      if (key.name === 'up') {
        index = Math.max(0, index - 1)
        process.stdout.write(eraseLines(delegate.windowSize))
        renderItems(items, delegate, index)
      } else if (key.name === 'down') {
        index = Math.min(items.length - 1, index + 1)
        process.stdout.write(eraseLines(delegate.windowSize))
        renderItems(items, delegate, index)
      } else if (key.name === 'return') {
        resolve(index)
      }
    })
  })
  rl.close()
  process.stdout.write(eraseLines(delegate.windowSize + 1))
  process.stdout.write(cursorShow)
  process.removeListener('exit', handleExit)
  return items[answer]
}
