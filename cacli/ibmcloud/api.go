package ibmcloud

import (
	"bytes"
	"encoding/json"
	"io"
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

// TODO: logical timeout, 10 seconds wasn't long enough.
var client = http.Client{
	Timeout: time.Duration(0 * time.Second),
}

// TODO: We need to check the response for errors.
// TODO: return interface instead of side effects.
// QUESTION: How do we handle Decoding if we don't have the struct passed in?
////
// bodyBytes, err := ioutil.ReadAll(resp.Body)
// if err != nil {
// 	panic(err)
// }
// bodyString := string(bodyBytes)
// fmt.Println(bodyString)
////

func FileUpload(endpoint string, header map[string]string, body io.Reader, res interface{}) error {
	request, err := http.NewRequest(http.MethodPut, endpoint, body)
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

func PostForm(endpoint string, header map[string]string, form url.Values, res interface{}) error {
	request, err := http.NewRequest(http.MethodPost, endpoint, strings.NewReader(form.Encode()))
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

func PostBody(endpoint string, header map[string]string, jsonValue []byte, res interface{}) error {
	request, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewBuffer(jsonValue))
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
	header := map[string]string{}

	result := &IdentityEndpoints{}
	err := Fetch(identityEndpoint, header, result)
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
	err := PostForm(endpoint, header, form, result)
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
	err := PostForm(endpoint, header, form, result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func getAccounts(token string) (*Accounts, error) {
	header := map[string]string{
		"Authorization": "Bearer " + token,
	}

	result := &Accounts{}
	err := Fetch(accountsEndpoint, header, result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

// TODO: better way to pass url encoded params.
func getResources(token string, resourceID string) (*Resources, error) {
	endpoint := resourcesEndpoint + "?resource_id=" + resourceID

	header := map[string]string{
		"Authorization": "Bearer " + token,
	}

	result := &Resources{}
	err := Fetch(endpoint, header, result)
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
	err := Fetch(endpoint, header, result)
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
	err = PostBody(resourceKeysEndpoint, header, jsonValue, result)
	if err != nil {
		return nil, err
	}

	return result, nil
}
