const request = require('request-promise-native')
const WebSocket = require('ws')

module.exports.authenticate = apiKey =>
  request({
    method: 'POST',
    url: 'https://iam.bluemix.net/identity/token',
    json: true,
    form: {
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
      apikey: apiKey
    }
  }).then(body => {
    return body.access_token
  })

module.exports.socket = (url, token, instanceId, modelId) =>
  new WebSocket(`${url}/v3/models/${modelId}/monitor`.replace('https', 'wss'), {
    headers: { 'ML-Instance-ID': instanceId, Authorization: `bearer ${token}` }
  })

module.exports.getModel = (url, token, instanceId, modelId) =>
  request({
    method: 'GET',
    json: true,
    url: `${url}/v3/models/${modelId}`,
    auth: { bearer: token },
    headers: { 'ML-Instance-ID': instanceId }
  })

module.exports.getModels = (url, token, instanceId) =>
  request({
    method: 'GET',
    json: true,
    url: `${url}/v3/models`,
    auth: { bearer: token },
    headers: { 'ML-Instance-ID': instanceId }
  })

module.exports.postModel = (url, token, instanceId, trainingRun) =>
  request({
    method: 'POST',
    json: true,
    url: `${url}/v3/models`,
    auth: { bearer: token },
    headers: { 'ML-Instance-ID': instanceId },
    body: trainingRun
  })

module.exports.postTrainingDefinition = (
  url,
  token,
  instanceId,
  trainingDefinition
) =>
  request({
    method: 'POST',
    json: true,
    url: `${url}/v3/ml_assets/training_definitions`,
    auth: { bearer: token },
    headers: { 'ML-Instance-ID': instanceId },
    body: trainingDefinition
  })

module.exports.putTrainingDefinition = (url, token, instanceId, trainingZip) =>
  trainingZip.pipe(
    request({
      method: 'PUT',
      json: true,
      url: url,
      auth: { bearer: token },
      headers: {
        'ML-Instance-ID': instanceId,
        'content-type': 'application/octet-stream'
      }
    })
  )
