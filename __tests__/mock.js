const COS = require('ibm-cos-sdk')
const api = require('./../src/api/api')
const badAuth = require('./fixtures/bad-auth.json')
const goodAuth = require('./fixtures/good-auth.json')
const getModels = require('./fixtures/get-models.json')
const getModel = require('./fixtures/get-model-completed.json')

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

  sinon.stub(api, 'socket').callsFake((url, token, modelId) => {
    return new Promise((resolve, _) => {
      resolve('x')
    })
  })

  sinon.stub(api, 'getModel').callsFake((url, token, modelId) => {
    return new Promise((resolve, _) => {
      resolve(getModel)
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
