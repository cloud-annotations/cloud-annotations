module.exports = (region, local) => {
  let compatMap = {
    us: 'us',
    'us-geo': 'us',
    'dal.us': 'dal.us',
    'dal-us-geo': 'dal.us',
    'wdc.us': 'wdc.us',
    'wdc-us-geo': 'wdc.us',
    'sjc.us': 'sjc.us',
    'sjc-us-geo': 'sjc.us',
    eu: 'eu',
    'eu-geo': 'eu',
    'ams.eu': 'ams.eu',
    'ams-eu-geo': 'ams.eu',
    'fra.eu': 'fra.eu',
    'fra-eu-geo': 'fra.eu',
    'mil.eu': 'mil.eu',
    'mil-eu-geo': 'mil.eu',
    ap: 'ap',
    'ap-geo': 'ap',
    'tok.ap': 'tok.ap',
    'tok-ap-geo': 'tok.ap',
    'seo.ap': 'seo.ap',
    'seo-ap-geo': 'seo.ap',
    'hkg.ap': 'hkg.ap',
    'hkg-ap-geo': 'hkg.ap',
    'us-south': 'us-south',
    'us-east': 'us-east',
    'eu-gb': 'eu-gb',
    'eu-de': 'eu-de',
    'jp-tok': 'jp-tok',
    'au-syd': 'au-syd',
    ams03: 'ams03',
    che01: 'che01',
    mel01: 'mel01',
    osl01: 'osl01',
    tor01: 'tor01',
    sao01: 'sao01',
    seo01: 'seo01',
    mon01: 'mon01',
    mex01: 'mex01',
    sjc04: 'sjc04',
    mil01: 'mil01',
    hkg02: 'hkg02'
  }

  region = compatMap[region]

  let private
  if (local) {
    private = ''
  } else {
    private = 'private.'
  }
  return `https://s3.${private}${region}.cloud-object-storage.appdomain.cloud`
}
