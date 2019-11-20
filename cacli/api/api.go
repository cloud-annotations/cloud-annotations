package api

import (
	"encoding/json"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"
)

var timeout = time.Duration(5 * time.Second)
var client = http.Client{
	Timeout: timeout,
}

// Authenticate authenticates against the api key from a users ibmcloud credentials
func Authenticate(apikey string) string {
	form := url.Values{}
	form.Add("grant_type", "urn:ibm:params:oauth:grant-type:apikey")
	form.Add("apikey", apikey)
	request, err := http.NewRequest("POST", "https://iam.bluemix.net/identity/token", strings.NewReader(form.Encode()))
	if err != nil {
		log.Fatalln(err)
	}

	resp, err := client.Do(request)
	if err != nil {
		log.Fatalln(err)
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		log.Fatalln(err)
	}
	return result["access_token"].(string)
}

func GetModel(url, token, modelId string) {
	request, err := http.NewRequest("GET", url+"/v3/models/"+modelId, nil)
	if err != nil {
		log.Fatalln(err)
	}
	bearer := "Bearer " + token
	request.Header.Add("Authorization", bearer)

	resp, err := client.Do(request)
	if err != nil {
		log.Fatalln(err)
	}
	var result map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		log.Fatalln(err)
	}
}

func GetModels(url, token string) {
	request, err := http.NewRequest("GET", url+"/v3/models", nil)
	if err != nil {
		log.Fatalln(err)
	}
	bearer := "Bearer " + token
	request.Header.Add("Authorization", bearer)

	resp, err := client.Do(request)
	if err != nil {
		log.Fatalln(err)
	}
	var result map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		log.Fatalln(err)
	}
}

func PostModel(url, token string) {

}

func PostTrainingDefinition(url, token, instanceId string) {

}

func PutTrainingDefinition(url, token, instanceId string) {

}
