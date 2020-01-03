package ibmcloud

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"strings"
)

func handleRequest(request *http.Request, header map[string]string, res interface{}) error {
	for key, value := range header {
		request.Header.Add(key, value)
	}

	resp, err := client.Do(request)
	if err != nil {
		return err
	}

	defer resp.Body.Close()

	if !(resp.StatusCode >= 200 && resp.StatusCode < 300) {
		return getError(resp)
	}

	if err = json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return err
	}
	return nil
}

// fileUpload takes in data and handles making the put request
func fileUpload(endpoint string, header map[string]string, body io.Reader, res interface{}) error {
	request, err := http.NewRequest(http.MethodPut, endpoint, body)
	if err != nil {
		return err
	}

	return handleRequest(request, header, res)
}

// postForm makes a post request with form data
func postForm(endpoint string, header map[string]string, form url.Values, res interface{}) error {
	request, err := http.NewRequest(http.MethodPost, endpoint, strings.NewReader(form.Encode()))
	if err != nil {
		return err
	}

	return handleRequest(request, header, res)
}

// postBody makes a post request with json body
func postBody(endpoint string, header map[string]string, jsonValue []byte, res interface{}) error {
	request, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewBuffer(jsonValue))
	if err != nil {
		return err
	}

	return handleRequest(request, header, res)
}

// patch makes a patch request to url
func patch(endpoint string, header map[string]string, body []byte, res interface{}) error {
	request, err := http.NewRequest(http.MethodPatch, endpoint, bytes.NewBuffer(body))
	if err != nil {
		return err
	}

	return handleRequest(request, header, res)
}

// fetch makes a get request to endpoint
func fetch(endpoint string, header map[string]string, res interface{}) error {
	request, err := http.NewRequest(http.MethodGet, endpoint, nil)
	if err != nil {
		return err
	}

	return handleRequest(request, header, res)
}
