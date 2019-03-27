module.exports = input => {
  const ansi = [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
  ].join('|')

  const astral = '[\uD800-\uDBFF][\uDC00-\uDFFF]'

  return input
    .replace(new RegExp(ansi, 'g'), '')
    .replace(new RegExp(astral, 'g'), ' ').length
}
