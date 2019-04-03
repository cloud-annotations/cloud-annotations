const request = require('request-promise-native')
const WebSocket = require('ws')

module.exports.authenticate = (url, username, password) =>
  request({
    method: 'GET',
    json: true,
    url: `${url}/v3/identity/token`,
    auth: { user: username, pass: password }
  }).then(body => {
    return body.token
  })

module.exports.socket = (url, token, modelId) =>
  new WebSocket(`${url}/v3/models/${modelId}/monitor`.replace('https', 'wss'), {
    headers: { Authorization: `bearer ${token}` }
  })

module.exports.getModel = (url, token, modelId) =>
  request({
    method: 'GET',
    json: true,
    url: `${url}/v3/models/${modelId}`,
    auth: { bearer: token }
  })

module.exports.getModels = (url, token) =>
  request({
    method: 'GET',
    json: true,
    url: `${url}/v3/models`,
    auth: { bearer: token }
  })

module.exports.postModel = (url, token, trainingRun) =>
  request({
    method: 'POST',
    json: true,
    url: `${url}/v3/models`,
    auth: { bearer: token },
    body: trainingRun
  })

module.exports.postTrainingDefinition = (url, token, trainingDefinition) =>
  request({
    method: 'POST',
    json: true,
    url: `${url}/v3/ml_assets/training_definitions`,
    auth: { bearer: token },
    body: trainingDefinition
  })

module.exports.putTrainingDefinition = (url, token, trainingZip) =>
  trainingZip.pipe(
    request({
      method: 'PUT',
      json: true,
      url: url,
      auth: { bearer: token },
      headers: { 'content-type': 'application/octet-stream' }
    })
  )
