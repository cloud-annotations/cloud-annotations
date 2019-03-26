module.exports = (fn, defaultVal) => {
  try {
    return fn()
  } catch (e) {
    return defaultVal
  }
}
