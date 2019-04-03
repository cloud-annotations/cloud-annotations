module.exports = (e, level) => {
  let log = console.error
  if (level.includes('warn')) {
    log = console.warn
  }
  switch (e.code) {
    case 'InvalidAccessKeyId':
      // InvalidAccessKeyId - The AWS Access Key ID you provided does not exist in our records.
      log(
        `${level} The provided Cloud Object Storage \`access_key_id\` is invalid.`
      )
      return
    case 'CredentialsError':
      // CredentialsError - Missing credentials in config
      log(`${level} No Cloud Object Storage credentials were provided.`)
      return
    case 'SignatureDoesNotMatch':
      // SignatureDoesNotMatch - The request signature we calculated does not match the signature you provided. Check your AWS Secret Access Key and signing method. For more information, see REST Authentication and SOAP Authentication for details.
      log(
        `${level} The provided Cloud Object Storage \`secret_access_key\` is invalid.`
      )
      return
    case 'UnknownEndpoint':
      // UnknownEndpoint - Inaccessible host: `s3-api.XXX.objectstorage.softlayer.net'. This service may not be available in the `us-east-1' region.
      log(`${level} The provided Cloud Object Storage \`region\` is invalid.`)
      return
    default:
      log(`${level} ${e.code} - ${e.message}`)
      return
  }
}
