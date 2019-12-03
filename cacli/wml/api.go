package wml

import (
	"net/http"
	"time"

	"github.com/cloud-annotations/training/cacli/ibmcloud"
)

var client = http.Client{
	Timeout: time.Duration(10 * time.Second),
}

func getModel(url string, token string, instanceID string, modelID string) (*Model, error) {
	var result = &Model{}
	header := map[string]string{
		"Authorization":  "Bearer " + token,
		"ML-Instance-ID": instanceID,
	}
	err := ibmcloud.Fetch(url+"/v3/models/"+modelID, header, result)
	if err != nil {
		return nil, err
	}
	return result, nil
}

func getModels(url string, token string, instanceID string) (*Models, error) {
	var result = &Models{}
	header := map[string]string{
		"Authorization":  "Bearer " + token,
		"ML-Instance-ID": instanceID,
	}
	err := ibmcloud.Fetch(url+"/v3/models", header, result)
	if err != nil {
		return nil, err
	}
	return result, nil
}

func PostModel(url, token string) {

}

func PostTrainingDefinition(url, token, instanceId string) {

}

func PutTrainingDefinition(url, token, instanceId string) {

}
