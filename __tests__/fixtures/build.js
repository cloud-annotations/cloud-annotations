const fs = require('fs')
const yaml = require('js-yaml')
const api = require('./../../src/api/api')

const dump = (name, json) => {
  const string = JSON.stringify(json)
  fs.writeFileSync(`./__tests__/fixtures/${name}.json`, string)
}

const main = async () => {
  const config = yaml.safeLoad(fs.readFileSync('./config.yaml'))

  const { url, username, password } = config.credentials.wml
  const token = await api.authenticate(url, username, password)
  // dump('good-auth', token)
  // try {
  //   await api.authenticate()
  // } catch (e) {
  //   dump('bad-auth', e)
  // }
  // dump('get-models', await api.getModels(url, token))
  // api.getModel(url, token, modelId)
  // dump('get-model-completed', await api.getModel(url, token, 'model-4bef4k60'))
  // dump('get-model-error', await api.getModel(url, token, 'model-1g47xe42'))
  // dump('get-model-running', await api.getModel(url, token, 'x'))
  // dump('get-model-canceled', await api.getModel(url, token, 'x'))
}

main()
