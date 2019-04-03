const fs = require('fs')
const yaml = require('js-yaml')
const request = require('request-promise-native')
const api = require('./../../src/api/api')
const cosEndpointBuilder = require('./../../src/utils/cosEndpointBuilder')

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

  // const DEFAULT_TRAINING_DEFINITION = {
  //   name: 'def-test',
  //   framework: {
  //     name: 'tensorflow',
  //     version: '1.12',
  //     runtimes: [
  //       {
  //         name: 'python',
  //         version: '3.6'
  //       }
  //     ]
  //   }
  // }
  // dump(
  //   'training-definition',
  //   await api.postTrainingDefinition(url, token, DEFAULT_TRAINING_DEFINITION)
  // )

  // const trainingDefinition = require('./training-definition.json')
  // const trainingZip = request(
  //   `https://github.com/cloud-annotations/training/releases/download/v1.0.12/training.zip`
  // )

  // dump(
  //   'put-training-definition',
  //   await api.putTrainingDefinition(
  //     trainingDefinition.entity.training_definition_version.content_url,
  //     token,
  //     trainingZip
  //   )
  // )

  // const { region, secret_access_key, access_key_id } = config.credentials.cos
  // const trainingDefinition = require('./training-definition.json')
  // const command = `cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && ./start.sh 500`
  // const connection = {
  //   endpoint_url: cosEndpointBuilder(region, false),
  //   access_key_id: access_key_id,
  //   secret_access_key: secret_access_key
  // }
  // const trainingRun = {
  //   model_definition: {
  //     framework: {
  //       name: trainingDefinition.entity.framework.name,
  //       version: trainingDefinition.entity.framework.version
  //     },
  //     name: 'name',
  //     author: {},
  //     definition_href: trainingDefinition.metadata.url,
  //     execution: {
  //       command: command,
  //       compute_configuration: { name: 'k80' }
  //     }
  //   },
  //   training_data_reference: {
  //     connection: connection,
  //     source: { bucket: config.buckets.training },
  //     type: 's3'
  //   },
  //   training_results_reference: {
  //     connection: connection,
  //     target: { bucket: config.buckets.output },
  //     type: 's3'
  //   }
  // }

  // dump('post-model', await api.postModel(url, token, trainingRun))
}

main()
