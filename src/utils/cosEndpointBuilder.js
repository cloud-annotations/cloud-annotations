module.exports = (region, local) => {
  let base
  if (region.includes('us-geo')) {
    base = 's3-api.'
  } else {
    base = 's3.'
  }

  let end
  if (local) {
    end = '.objectstorage.softlayer.net'
  } else {
    end = '.objectstorage.service.networklayer.com'
  }
  return `https://${base}${region}${end}`
}
