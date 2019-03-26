module.exports = () => {
  const config = []
  return {
    add: option => {
      config.push(option)
    },
    parse: options => {
      const splitOps = [].concat.apply([], options.map(op => op.split('=')))
      var usedOps = []

      const ops = {}
      // Pull our flags
      const flags = config.filter(op => Array.isArray(op))
      flags.forEach(flag => {
        splitOps.forEach((op, i) => {
          if (flag.includes(op) && !usedOps.includes(i)) {
            if (flag[0] === true) {
              ops[getName(flag.slice(1, flag.length))] = true
              usedOps = [...usedOps, i]
            } else {
              ops[getName(flag)] = splitOps[i + 1]
              usedOps = [...usedOps, i, i + 1]
            }
          }
        })
      })

      const leftOvers = splitOps.filter((_, i) => !usedOps.includes(i))

      const positional = config.filter(op => !Array.isArray(op))
      positional.forEach(option => {
        ops[option] = leftOvers.shift()
      })

      return ops
    }
  }
}

const opWeight = op => {
  if (op.startsWith('--')) {
    return 1
  }
  if (op.startsWith('-')) {
    return 2
  }
  return 0
}

const getName = flag => {
  var f = flag.sort((a, b) => opWeight(a) > opWeight(b))[0]
  if (f.startsWith('-')) {
    f = f.replace('-', '')
  }
  if (f.startsWith('-')) {
    f = f.replace('-', '')
  }
  return f
}
