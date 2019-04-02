const COS = require('ibm-cos-sdk')
const api = require('./../src/api/api')
const badAuth = require('./fixtures/bad-auth.json')
const goodAuth = require('./fixtures/good-auth.json')
const getModels = require('./fixtures/get-models.json')
const getModel = require('./fixtures/get-model-completed.json')
const getModelRunning = require('./fixtures/get-model-running.json')

const validUsername = 'username'
const validPassword = 'password'
const validUrl = 'url'
const validAccessKeyId = 'access_key_id'
const validSecretAccessKey = 'secret_access_key'
const validRegion = 'us-geo'
const validBucket = 'bucket'
const invalidBucket = 'out-of-region'
const randomError = 'random-error'

module.exports.wml = sinon => {
  sinon.stub(api, 'authenticate').callsFake((url, username, password) => {
    return new Promise((resolve, _) => {
      if (
        url !== validUrl ||
        username !== validUsername ||
        password !== validPassword
      ) {
        throw Error(badAuth)
      }
      resolve(goodAuth)
    })
  })

  // cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && ./start.sh 50
  //INFO:tensorflow:loss = 16.405922, step = 2 (1.722 sec)
  // INFO:tensorflow:global_step/sec: 0.676177
  // INFO:tensorflow:global_step/sec: 0.676177
  // INFO:tensorflow:loss = 15.320669, step = 3 (1.479 sec)
  // INFO:tensorflow:loss = 15.320669, step = 3 (1.479 sec)
  // INFO:tensorflow:global_step/sec: 0.7627
  // INFO:tensorflow:global_step/sec: 0.7627
  // INFO:tensorflow:loss = 14.487283, step = 4 (1.311 sec)
  // INFO:tensorflow:loss = 14.487283, step = 4 (1.311 sec)
  // INFO:tensorflow:global_step/sec: 0.730708
  // INFO:tensorflow:global_step/sec: 0.730708
  // INFO:tensorflow:loss = 13.580031, step = 5 (1.368 sec)
  // INFO:tensorflow:loss = 13.580031, step = 5 (1.368 sec)
  // INFO:tensorflow:global_step/sec: 0.769618
  // INFO:tensorflow:global_step/sec: 0.769618
  // INFO:tensorflow:loss = 12.474336, step = 6 (1.299 sec)
  // INFO:tensorflow:loss = 12.474336, step = 6 (1.299 sec)

  sinon.stub(api, 'socket').callsFake((url, token, modelId) => {
    return new Promise((resolve, _) => {
      resolve({
        on: (key, fn) => {
          if (key === 'message') {
            const res1 = {
              status: {
                message: 'i am a message'
              }
            }
            const res2 = {}
            const res3 = {
              status: {}
            }
            const res4 = {
              status: {
                message: ''
              }
            }
            const real1 = {
              status: {
                message:
                  'INFO:tensorflow:loss = 16.405922, step = 20 (1.722 sec)'
              }
            }
            const real2 = {
              status: {
                message: 'INFO:tensorflow:global_step/sec: 0.676177'
              }
            }
            const real3 = {
              status: {
                message:
                  'INFO:tensorflow:loss = 15.320669, step = 40 (1.479 sec)'
              }
            }
            const real4 = {
              status: {
                message:
                  'INFO:tensorflow:loss = 15.320669, step = 40 (1.479 sec)'
              }
            }
            const real5 = {
              status: {
                message: 'INFO:tensorflow:global_step/sec: 0.132456'
              }
            }
            const real6 = {
              status: {
                message:
                  'INFO:tensorflow:loss = 15.320669, step = 50 (1.479 sec)'
              }
            }
            const real7 = {
              status: {
                message: 'training success'
              }
            }

            fn(JSON.stringify(res1))
            fn(JSON.stringify(res2))
            fn(JSON.stringify(res3))
            fn(JSON.stringify(res4))
            fn(JSON.stringify(res1))
            fn(JSON.stringify(real1))
            fn(JSON.stringify(real2))
            fn(JSON.stringify(real3))
            fn(JSON.stringify(real4))
            fn(JSON.stringify(real5))
            fn(JSON.stringify(real6))
            fn(JSON.stringify(real7))
          }
          if (key === 'open') {
            fn()
          }
          if (key === 'close') {
            fn()
          }
        }
      })
    })
  })

  sinon.stub(api, 'getModel').callsFake((url, token, modelId) => {
    return new Promise((resolve, _) => {
      if (modelId === 'model-completed') {
        return resolve(getModel)
      }
      return resolve(getModelRunning)
    })
  })

  sinon.stub(api, 'getModels').callsFake((url, token) => {
    return new Promise((resolve, _) => {
      resolve(getModels)
    })
  })

  sinon.stub(api, 'postModel').callsFake((url, token, trainingRun) => {
    return new Promise((resolve, _) => {
      resolve('x')
    })
  })

  sinon
    .stub(api, 'postTrainingDefinition')
    .callsFake((url, token, trainingDefinition) => {
      return new Promise((resolve, _) => {
        resolve('x')
      })
    })

  sinon
    .stub(api, 'putTrainingDefinition')
    .callsFake((trainingDefinition, token, trainingZip) => {
      return new Promise((resolve, _) => {
        resolve('x')
      })
    })
}

module.exports.cos = sinon => {
  sinon.stub(COS, 'S3').callsFake(config => {
    const { endpoint, accessKeyId, secretAccessKey } = config
    return {
      createBucket: options => ({
        promise: () =>
          new Promise((resolve, _) => {
            // {
            //   Bucket: bucketName,
            //   CreateBucketConfiguration: { LocationConstraint: null }
            // }
            resolve('x')
          })
      }),
      listBuckets: () => ({
        promise: () =>
          new Promise((resolve, _) => {
            if (endpoint.includes(randomError)) {
              const error = new Error()
              error.code = 'FakeError'
              throw error
            }
            if (!endpoint.includes(validRegion)) {
              const error = new Error()
              error.code = 'UnknownEndpoint'
              throw error
            }
            if (accessKeyId === '' && secretAccessKey === '') {
              const error = new Error()
              error.code = 'CredentialsError'
              throw error
            }
            if (accessKeyId !== validAccessKeyId) {
              const error = new Error()
              error.code = 'InvalidAccessKeyId'
              throw error
            }
            if (secretAccessKey !== validSecretAccessKey) {
              const error = new Error()
              error.code = 'SignatureDoesNotMatch'
              throw error
            }

            resolve({
              Buckets: [
                { Name: validBucket },
                { Name: invalidBucket },
                { Name: randomError }
              ]
            })
          })
      }),
      listObjectsV2: options => ({
        promise: () =>
          new Promise((resolve, _) => {
            // { Bucket: bucket, Prefix: `${prefix}/${path}` }
            // { Bucket: bucket }
            resolve('x')
          })
      }),
      getBucketLocation: options => ({
        promise: () =>
          new Promise((resolve, _) => {
            // { Bucket: bucket }
            if (options.Bucket === invalidBucket) {
              throw Error()
            }
            if (options.Bucket === randomError) {
              return resolve({})
            }
            resolve({ LocationConstraint: 'fake-location' })
          })
      }),
      upload: options => ({
        promise: () =>
          new Promise((resolve, _) => {
            // {
            //   Bucket: bucket,
            //   Key: path.relative(dir, file.path),
            //   Body: data
            // }
            resolve('x')
          })
      }),
      getObject: options => ({
        promise: () =>
          new Promise((resolve, _) => {
            if (options.Key.includes('learner-1/training-log.txt')) {
              return resolve({ Body: 'this is a a big log output.' })
            }
            // {
            //   Bucket: bucket,
            //   Key: file
            // }
            resolve('x')
          })
      })
    }
  })
}
