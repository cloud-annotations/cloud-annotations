module.exports = () =>
  new Promise((resolve, _) => {
    process.nextTick(resolve)
  })
