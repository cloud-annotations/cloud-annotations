package ibmcloud

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
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
	accountsRoot         = protocol + subdomainAccounts + api
	resourcesRoot        = protocol + subdomainResourceController + api
	accountsEndpoint     = accountsRoot + "/coe/v2/accounts"
	resourcesEndpoint    = resourcesRoot + "/v2/resource_instances"
	resourceKeysEndpoint = resourcesRoot + "/v2/resource_keys"
)

// grant types
const (
	passcodeGrantType     = "urn:ibm:params:oauth:grant-type:passcode"
	apikeyGrantType       = "urn:ibm:params:oauth:grant-type:apikey"
	refreshTokenGrantType = "refresh_token"
)

const basicAuth = "Basic Yng6Yng="

// TODO: logical timeout, 10 seconds wasn't long enough.
var client = http.Client{
	Timeout: time.Duration(0 * time.Second),
}

//// useful for logging
// bodyBytes, err := ioutil.ReadAll(resp.Body)
// if err != nil {
// 	panic(err)
// }
// bodyString := string(bodyBytes)
// fmt.Println(bodyString)
////

func getError(resp *http.Response) error {
	var errorTemplate ErrorMessage
	if err := json.NewDecoder(resp.Body).Decode(&errorTemplate); err != nil {
		return err
	}
	if errorTemplate.Error != nil {
		return errors.New(errorTemplate.Error[0].Message)
	}
	if errorTemplate.Errors != nil {
		return errors.New(errorTemplate.Errors[0].Message)
	}
	return errors.New("unknown")
}

func getIdentityEndpoints() (*IdentityEndpoints, error) {
	header := map[string]string{}

	result := &IdentityEndpoints{}
	err := fetch(identityEndpoint, header, result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func getToken(endpoint string, otp string) (*Token, error) {
	header := map[string]string{
		"Authorization": basicAuth,
	}

	form := url.Values{}
	form.Add("grant_type", passcodeGrantType)
	form.Add("passcode", otp)

	result := &Token{}
	err := postForm(endpoint, header, form, result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func getTokenFromIAM(endpoint string, apikey string) (*Token, error) {
	header := map[string]string{
		"Authorization": basicAuth,
	}

	form := url.Values{}
	form.Add("grant_type", apikeyGrantType)
	form.Add("apikey", apikey)

	result := &Token{}
	err := postForm(endpoint, header, form, result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func upgradeToken(endpoint string, refreshToken string, accountID string) (*Token, error) {
	header := map[string]string{
		"Authorization": basicAuth,
	}

	form := url.Values{}
	form.Add("grant_type", refreshTokenGrantType)
	form.Add("refresh_token", refreshToken)
	if accountID != "" {
		form.Add("bss_account", accountID)
	}

	result := &Token{}
	err := postForm(endpoint, header, form, result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func getAccounts(endpoint *string, token string) (*Accounts, error) {
	if endpoint == nil {
		endpointString := accountsEndpoint
		endpoint = &endpointString
	} else {
		endpointString := accountsEndpoint + *endpoint
		endpoint = &endpointString
	}

	header := map[string]string{
		"Authorization": "Bearer " + token,
	}

	result := &Accounts{}
	err := fetch(*endpoint, header, result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

// TODO: better way to pass url encoded params.
func getResources(endpoint *string, token string, resourceID string) (*Resources, error) {
	if endpoint == nil {
		endpointString := resourcesEndpoint + "?resource_id=" + resourceID
		endpoint = &endpointString
	} else {
		endpointString := resourcesRoot + *endpoint
		endpoint = &endpointString
	}

	header := map[string]string{
		"Authorization": "Bearer " + token,
	}

	result := &Resources{}
	err := fetch(*endpoint, header, result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func getCredentials(token string, params GetCredentialsParams) (*Credentials, error) {
	endpoint := resourceKeysEndpoint + "?name=" + params.Name + "&source_crn=" + params.Crn

	header := map[string]string{
		"Authorization": "Bearer " + token,
	}

	result := &Credentials{}
	err := fetch(endpoint, header, result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func createCredential(token string, params CreateCredentialParams) (*Credential, error) {
	header := map[string]string{
		"Authorization": "Bearer " + token,
	}

	jsonValue, err := json.Marshal(params)
	if err != nil {
		return nil, err
	}

	result := &Credential{}
	err = postBody(resourceKeysEndpoint, header, jsonValue, result)
	if err != nil {
		return nil, err
	}

	return result, nil
}
