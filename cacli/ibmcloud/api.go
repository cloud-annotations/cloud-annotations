package ibmcloud

import (
	"encoding/json"
	"log"
	"net/http"
	"net/url"
	"strings"
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

func getIdentityEndpoints() IdentityEndpoints {
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

func getToken(endpoint string, otp string) Token {
	form := url.Values{}
	form.Add("grant_type", "urn:ibm:params:oauth:grant-type:passcode")
	form.Add("passcode", otp)
	request, err := http.NewRequest("POST", endpoint, strings.NewReader(form.Encode()))
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

	var result Token
	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		log.Fatalln(err)
	}
	return result
}

func getAccounts(token string) Accounts {
	request, err := http.NewRequest("GET", "https://accounts.cloud.ibm.com/coe/v2/accounts", nil)
	if err != nil {
		log.Fatalln(err)
	}

	basic := "Bearer " + token
	request.Header.Add("Authorization", basic)

	resp, err := client.Do(request)
	if err != nil {
		log.Fatalln(err)
	}
	defer resp.Body.Close()

	var result Accounts
	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		log.Fatalln(err)
	}
	return result
}

func upgradeToken(endpoint string, refreshToken string, accountID string) Token {
	form := url.Values{}
	form.Add("grant_type", "refresh_token")
	form.Add("refresh_token", refreshToken)
	form.Add("bss_account", accountID)
	request, err := http.NewRequest("POST", endpoint, strings.NewReader(form.Encode()))
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

	var result Token
	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		log.Fatalln(err)
	}
	return result
}

func getResources(endpoint string, token string) Resources {
	request, err := http.NewRequest("GET", endpoint, nil)
	if err != nil {
		log.Fatalln(err)
	}

	basic := "Bearer " + token
	request.Header.Add("Authorization", basic)

	resp, err := client.Do(request)
	if err != nil {
		log.Fatalln(err)
	}

	defer resp.Body.Close()

	var result Resources
	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		log.Fatalln(err)
	}
	return result
}

func getObjectStorageResources(token string) Resources {
	endpoint := "https://resource-controller.cloud.ibm.com/v2/resource_instances?resource_id=dff97f5c-bc5e-4455-b470-411c3edbe49c"
	return getResources(endpoint, token)
}

func getMachineLearningResources(token string) Resources {
	endpoint := "https://resource-controller.cloud.ibm.com/v2/resource_instances?resource_id=51c53b72-918f-4869-b834-2d99eb28422a"
	return getResources(endpoint, token)
}

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
