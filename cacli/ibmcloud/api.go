package ibmcloud

import (
	"bytes"
	"encoding/json"
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
	Timeout: time.Duration(10 * time.Second),
}

// TODO: return interface instead of side effects.
// QUESTION: How do we handle Decoding if we don't have the struct passed in?

func PostForm(endpoint string, authString string, form url.Values, res interface{}) error {
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

func PostBody(endpoint string, authString string, jsonValue []byte, res interface{}) error {
	request, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewBuffer(jsonValue))
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

func Fetch(endpoint string, header map[string]string, res interface{}) error {
	request, err := http.NewRequest(http.MethodGet, endpoint, nil)
	if err != nil {
		return err
	}

	for key, value := range header {
		request.Header.Add(key, value)
	}

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

func getIdentityEndpoints() (*IdentityEndpoints, error) {
	var result = &IdentityEndpoints{}
	header := map[string]string{}
	err := Fetch(identityEndpoint, header, result)
	if err != nil {
		return nil, err
	}
	return result, nil
}

func getToken(endpoint string, otp string) (*Token, error) {
	form := url.Values{}
	form.Add("grant_type", passcodeGrantType)
	form.Add("passcode", otp)

	var result = &Token{}
	err := PostForm(endpoint, basicAuth, form, result)
	if err != nil {
		return nil, err
	}
	return result, nil
}

func upgradeToken(endpoint string, refreshToken string, accountID string) (*Token, error) {
	form := url.Values{}
	form.Add("grant_type", refreshTokenGrantType)
	form.Add("refresh_token", refreshToken)
	if accountID != "" {
		form.Add("bss_account", accountID)
	}

	var result = &Token{}
	err := PostForm(endpoint, basicAuth, form, result)
	if err != nil {
		return nil, err
	}
	return result, nil
}

func getAccounts(token string) (*Accounts, error) {
	var result = &Accounts{}
	header := map[string]string{
		"Authorization": "Bearer " + token,
	}
	err := Fetch(accountsEndpoint, header, result)
	if err != nil {
		return nil, err
	}
	return result, nil
}

// TODO: better way to pass url encoded params.
func getResources(token string, resourceID string) (*Resources, error) {
	endpoint := resourcesEndpoint + "?resource_id=" + resourceID
	var result = &Resources{}
	header := map[string]string{
		"Authorization": "Bearer " + token,
	}
	err := Fetch(endpoint, header, result)
	if err != nil {
		return nil, err
	}
	return result, nil
}

func getCredentials(token string, params GetCredentialsParams) (*Credentials, error) {
	endpoint := resourceKeysEndpoint + "?name=" + params.Name + "&source_crn=" + params.Crn
	var result = &Credentials{}
	header := map[string]string{
		"Authorization": "Bearer " + token,
	}
	err := Fetch(endpoint, header, result)
	if err != nil {
		return nil, err
	}
	return result, nil
}

func createCredential(token string, params CreateCredentialParams) (*Credential, error) {
	jsonValue, err := json.Marshal(params)
	if err != nil {
		return nil, err
	}

	var result = &Credential{}
	err = PostBody(resourceKeysEndpoint, "Bearer "+token, jsonValue, result)
	if err != nil {
		return nil, err
	}
	return result, nil
}
