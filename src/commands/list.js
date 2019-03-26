const moment = require('moment')
const WML = require('./../api/wml')
const loadConfig = require('./../utils/loadConfig')
const { red, green, bold, dim } = require('chalk')
const Table = require('./../utils/table')
const optionsParse = require('./../utils/optionsParse')

module.exports = async options => {
  const parser = optionsParse()
  parser.add([true, 'help', '--help', '-h'])
  const ops = parser.parse(options)

  if (ops.help) {
    console.log('cacli list')
    process.exit()
  }

  const config = loadConfig()
  const wml = new WML(config)
  const runs = await wml.listTrainingRuns()

  moment.updateLocale('en', {
    relativeTime: {
      future: '%s',
      past: '%s',
      s: 'just now',
      ss: 'just now',
      m: 'a minute ago',
      mm: '%d minutes ago',
      h: 'an hour ago',
      hh: '%d hours ago',
      d: 'a day ago',
      dd: '%d days ago',
      M: 'a month ago',
      MM: '%d months ago',
      y: 'a year ago',
      yy: '%d years ago'
    }
  })
  const table = new Table({
    columnBuffer: 3,
    width: 90,
    maxWidth: process.stdout.columns
  })
  table.addRow([
    { value: 'name', colorFunc: bold },
    { value: 'model id', width: '14', align: 'center', colorFunc: bold },
    { value: 'status', width: '11', align: 'center', colorFunc: bold },
    { value: 'submitted', width: '14', align: 'right', colorFunc: bold }
  ])
  runs.resources
    .sort(
      (a, b) =>
        new Date(a.entity.status.submitted_at) -
        new Date(b.entity.status.submitted_at)
    )
    .forEach(run => {
      const name = run.entity.model_definition.name
      const guid = run.metadata.guid
      const status = run.entity.status.state
      const submitted = moment(run.entity.status.submitted_at).fromNow()

      c = (() => {
        switch (status) {
          case 'completed':
            return { color: green, lum: x => x }
          case 'error':
            return { color: red, lum: dim }
          case 'canceled':
            return { color: dim, lum: dim }
          default:
            return { color: x => x, lum: x => x }
        }
      })()

      table.addRow([
        { value: name, colorFunc: c.lum },
        { value: guid, width: '14', colorFunc: c.lum },
        { value: status, width: '11', align: 'center', colorFunc: c.color },
        { value: submitted, width: '14', align: 'right', colorFunc: c.lum }
      ])
    })

  console.log(table.toString())
}
