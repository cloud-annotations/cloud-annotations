package ibmcloud

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"time"
)

// body, err := ioutil.ReadAll(resp.Body)
// if err != nil {
// 	panic(err)
// }
// log.Println(string(body))

var timeout = time.Duration(5 * time.Second)
var client = http.Client{
	Timeout: timeout,
}

func GetIdentityEndpoints() IdentityEndpoints {
	request, err := http.NewRequest("GET", "https://iam.cloud.ibm.com/identity/.well-known/openid-configuration", nil)
	if err != nil {
		log.Fatalln(err)
	}

	resp, err := client.Do(request)
	if err != nil {
		log.Fatalln(err)
	}
	defer resp.Body.Close()

	var result IdentityEndpoints
	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		log.Fatalln(err)
	}
	return result
}

func PostToken(endpoint string, otp string) {
	form := url.Values{}
	form.Add("grant_type", "urn:ibm:params:oauth:grant-type:passcode")
	form.Add("passcode", otp)
	request, err := http.NewRequest("POST", endpoint, nil)
	if err != nil {
		log.Fatalln(err)
	}

	basic := "Basic Yng6Yng="
	request.Header.Add("Authorization", basic)

	resp, err := client.Do(request)
	if err != nil {
		log.Fatalln(err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		panic(err)
	}
	log.Println(string(body))
}

//   const token = await request({
//     url: tokenEndpoint,
//     method: 'POST',
//     headers: {
//       Authorization: `Basic ${toBase64('bx:bx')}`
//     },
//     form: {
//       grant_type: 'urn:ibm:params:oauth:grant-type:passcode',
//       passcode: otp
//     },
//     json: true
//   })

//   const accountsJson = await request({
//     url: accountsEndpoint,
//     method: 'GET',
//     headers: {
//       Authorization: 'bearer ' + token.access_token
//     },
//     json: true
//   })

//   const upgradedToken = await request({
//     url: tokenEndpoint,
//     method: 'POST',
//     headers: {
//       Authorization: `Basic ${toBase64('bx:bx')}`
//     },
//     form: {
//       grant_type: 'refresh_token',
//       refresh_token: token.refresh_token,
//       bss_account: accountId
//     },
//     json: true
//   })

//   const objectStorageResources = await request({
//     url: objectStorageResourcesEndpoint,
//     method: 'GET',
//     headers: {
//       Authorization: 'bearer ' + upgradedToken.access_token
//     },
//     json: true
//   })

//   const machineLearningResources = await request({
//     url: machineLearningResourcesEndpoint,
//     method: 'GET',
//     headers: {
//       Authorization: 'bearer ' + upgradedToken.access_token
//     },
//     json: true
//   })

//   const findCredential = await request({
//     url: `https://resource-controller.${baseEndpoint}/v2/resource_keys?name=cloud-annotations-binding`,
//     method: 'GET',
//     headers: {
//       Authorization: 'bearer ' + upgradedToken.access_token
//     },
//     json: true
//   })

//     cosCredential = await request({
//       url: `https://resource-controller.${baseEndpoint}/v2/resource_keys`,
//       method: 'POST',
//       headers: {
//         Authorization: 'bearer ' + upgradedToken.access_token
//       },
//       body: {
//         name: 'cloud-annotations-binding',
//         source: objectStorage.id,
//         role: 'Writer',
//         parameters: { HMAC: true }
//       },
//       json: true
//     })
//   }
