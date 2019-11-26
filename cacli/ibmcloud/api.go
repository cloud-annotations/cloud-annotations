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
	Timeout: time.Duration(0 * time.Second),
}

// TODO: return interface instead of side effects.
// QUESTION: How do we handle Decoding if we don't have the struct passed in?

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

func postBody(endpoint string, authString string, jsonValue []byte, res interface{}) error {
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

func fetch(endpoint string, authString string, res interface{}) error {
	request, err := http.NewRequest(http.MethodGet, endpoint, nil)
	if err != nil {
		return err
	}

	if authString != "" {
		request.Header.Add("Authorization", authString)
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

func getIdentityEndpoints() (IdentityEndpoints, error) {
	var result IdentityEndpoints
	err := fetch(identityEndpoint, "", &result)
	if err != nil {
		return IdentityEndpoints{}, err
	}
	return result, nil
}

func getToken(endpoint string, otp string) (Token, error) {
	form := url.Values{}
	form.Add("grant_type", passcodeGrantType)
	form.Add("passcode", otp)

	var result Token
	err := postForm(endpoint, basicAuth, form, &result)
	if err != nil {
		return Token{}, err
	}
	return result, nil
}

func upgradeToken(endpoint string, refreshToken string, accountID string) (Token, error) {
	form := url.Values{}
	form.Add("grant_type", refreshTokenGrantType)
	form.Add("refresh_token", refreshToken)
	if accountID != "" {
		form.Add("bss_account", accountID)
	}

	var result Token
	err := postForm(endpoint, basicAuth, form, &result)
	if err != nil {
		return Token{}, err
	}
	return result, nil
}

func getAccounts(token string) (Accounts, error) {
	var result Accounts
	err := fetch(accountsEndpoint, "Bearer "+token, &result)
	if err != nil {
		return Accounts{}, err
	}
	return result, nil
}

// TODO: better way to pass url encoded params.
func getResources(token string, resourceID string) (Resources, error) {
	endpoint := resourcesEndpoint + "?resource_id=" + resourceID
	var result Resources
	err := fetch(endpoint, "Bearer "+token, &result)
	if err != nil {
		return Resources{}, err
	}
	return result, nil
}

func getCredentials(token string, params GetCredentialsParams) (Credentials, error) {
	endpoint := resourceKeysEndpoint + "?name=" + params.Name + "&source_crn=" + params.Crn
	var result Credentials
	err := fetch(endpoint, "Bearer "+token, &result)
	if err != nil {
		return Credentials{}, err
	}
	return result, nil
}

func createCredential(token string, params CreateCredentialParams) (Credential, error) {
	jsonValue, err := json.Marshal(params)
	if err != nil {
		return Credential{}, err
	}

	var result Credential
	err = postBody(resourceKeysEndpoint, "Bearer "+token, jsonValue, &result)
	if err != nil {
		return Credential{}, err
	}
	return result, nil
}
