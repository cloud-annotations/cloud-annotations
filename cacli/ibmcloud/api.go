package ibmcloud

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// protocol
const protocol = "https://"

// subdomains
const (
	subdomainIAM                = "iam."
	subdomainAccounts           = "accounts."
	subdomainResourceController = "resource-controller."
)

// domain
const api = "cloud.ibm.com"

// endpoints
const (
	identityEndpoint     = protocol + subdomainIAM + api + "/identity/.well-known/openid-configuration"
	accountsEndpoint     = protocol + subdomainAccounts + api + "/coe/v2/accounts"
	resourcesEndpoint    = protocol + subdomainResourceController + api + "/v2/resource_instances"
	resourceKeysEndpoint = protocol + subdomainResourceController + api + "/v2/resource_keys"
)

// grant types
const (
	passcodeGrantType     = "urn:ibm:params:oauth:grant-type:passcode"
	refreshTokenGrantType = "refresh_token"
)

const basicAuth = "Basic Yng6Yng="

var client = http.Client{
	Timeout: time.Duration(0 * time.Second),
}

func postForm(endpoint string, authString string, form url.Values, res interface{}) error {
	request, err := http.NewRequest(http.MethodPost, endpoint, strings.NewReader(form.Encode()))
	if err != nil {
		return err
	}

	request.Header.Add("Authorization", authString)

	resp, err := client.Do(request)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if err = json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return err
	}
	return nil
}

func getIdentityEndpoints() IdentityEndpoints {
	request, err := http.NewRequest(http.MethodGet, identityEndpoint, nil)
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
	form.Add("grant_type", passcodeGrantType)
	form.Add("passcode", otp)

	var result Token
	err := postForm(endpoint, basicAuth, form, &result)
	if err != nil {
		log.Fatalln(err)
	}
	return result
}

func getAccounts(token string) Accounts {
	request, err := http.NewRequest(http.MethodGet, accountsEndpoint, nil)
	if err != nil {
		log.Fatalln(err)
	}

	request.Header.Add("Authorization", "Bearer "+token)

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
	form.Add("grant_type", refreshTokenGrantType)
	form.Add("refresh_token", refreshToken)
	form.Add("bss_account", accountID)

	var result Token
	err := postForm(endpoint, basicAuth, form, &result)
	if err != nil {
		log.Fatalln(err)
	}
	return result
}

func getResources(endpoint string, token string) Resources {
	request, err := http.NewRequest(http.MethodGet, endpoint, nil)
	if err != nil {
		log.Fatalln(err)
	}

	request.Header.Add("Authorization", "Bearer "+token)

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
	endpoint := resourcesEndpoint + "?resource_id=dff97f5c-bc5e-4455-b470-411c3edbe49c"
	return getResources(endpoint, token)
}

func getMachineLearningResources(token string) Resources {
	endpoint := resourcesEndpoint + "?resource_id=51c53b72-918f-4869-b834-2d99eb28422a"
	return getResources(endpoint, token)
}

func getCredentials(token string) {
	endpoint := resourceKeysEndpoint + "?name=cloud-annotations-binding"
	request, err := http.NewRequest(http.MethodGet, endpoint, nil)
	if err != nil {
		log.Fatalln(err)
	}

	request.Header.Add("Authorization", "Bearer "+token)

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

func createCredential(token string, objectStorageID string) {
	form := url.Values{}
	form.Add("name", "cloud-annotations-binding")
	form.Add("source", objectStorageID)
	form.Add("role", "writer")
	form.Add("parameters", "{\"HMAC\":true}")
	request, err := http.NewRequest(http.MethodPost, resourceKeysEndpoint, strings.NewReader(form.Encode()))
	if err != nil {
		log.Fatalln(err)
	}

	request.Header.Add("Authorization", "Bearer "+token)

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
