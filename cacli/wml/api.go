package wml

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/cloud-annotations/training/cacli/ibmcloud"
)

// routes
const (
	modelsRoute = "/v3/models/"
)

var client = http.Client{
	Timeout: time.Duration(10 * time.Second),
}

func getModel(url string, token string, instanceID string, modelID string) (*Model, error) {
	endpoint := url + modelsRoute + modelID

	header := map[string]string{
		"Authorization":  "Bearer " + token,
		"ML-Instance-ID": instanceID,
	}

	var result = &Model{}
	err := ibmcloud.Fetch(endpoint, header, result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func getModels(url string, token string, instanceID string) (*Models, error) {
	endpoint := url + modelsRoute

	header := map[string]string{
		"Authorization":  "Bearer " + token,
		"ML-Instance-ID": instanceID,
	}

	var result = &Models{}
	err := ibmcloud.Fetch(endpoint, header, result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

// TODO: Check return type.
func PostModel(url string, token string, instanceID string, trainingRun Entity) (*Model, error) {
	endpoint := url + modelsRoute

	header := map[string]string{
		"Authorization":  "Bearer " + token,
		"ML-Instance-ID": instanceID,
	}

	jsonValue, err := json.Marshal(trainingRun)
	if err != nil {
		return nil, err
	}

	var result = &Model{}
	err = ibmcloud.PostBody(endpoint, header, jsonValue, result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func PostTrainingDefinition(url, token, instanceId string) {

}

func PutTrainingDefinition(url, token, instanceId string) {

}
