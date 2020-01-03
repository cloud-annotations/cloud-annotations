package ibmcloud

import (
	"encoding/json"
	"io"

	"github.com/cloud-annotations/training/cacli/ibmcloud/run"
)

// routes
const (
	modelsRoute             = "/v3/models"
	trainingDefinitionRoute = "/v3/ml_assets/training_definitions"
)

func getModel(url string, token string, instanceID string, modelID string) (*Model, error) {
	endpoint := url + modelsRoute + "/" + modelID

	header := map[string]string{
		"Authorization":  "Bearer " + token,
		"ML-Instance-ID": instanceID,
	}

	result := &Model{}
	err := fetch(endpoint, header, result)
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

	result := &Models{}
	err := fetch(endpoint, header, result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func postModel(url string, token string, instanceID string, trainingRun *run.TrainingRun) (*Model, error) {
	endpoint := url + modelsRoute

	header := map[string]string{
		"Authorization":  "Bearer " + token,
		"ML-Instance-ID": instanceID,
		"Content-Type":   "application/json",
	}

	jsonValue, err := json.Marshal(trainingRun)
	if err != nil {
		return nil, err
	}

	result := &Model{}
	err = postBody(endpoint, header, jsonValue, result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func postTrainingDefinition(url string, token string, instanceID string, trainingDefinition *TrainingDefinition) (*TrainingDefinitionRes, error) {
	endpoint := url + trainingDefinitionRoute

	header := map[string]string{
		"Authorization":  "Bearer " + token,
		"ML-Instance-ID": instanceID,
		"Content-Type":   "application/json",
	}

	jsonValue, err := json.Marshal(trainingDefinition)
	if err != nil {
		return nil, err
	}

	result := &TrainingDefinitionRes{}
	err = postBody(endpoint, header, jsonValue, result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func putTrainingDefinition(url string, token string, instanceID string, body io.Reader) (*TrainingScriptRes, error) {
	header := map[string]string{
		"Authorization":  "Bearer " + token,
		"ML-Instance-ID": instanceID,
		"Content-Type":   "application/octet-stream",
	}

	result := &TrainingScriptRes{}
	err := fileUpload(url, header, body, result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func cancelRun(url, token, instanceID, modelID string) error {
	url = url + modelsRoute + "/" + modelID
	header := map[string]string{
		"Authorization":  "Bearer " + token,
		"ML-Instance-ID": instanceID,
		"Content-Type":   "application/json",
	}

	payload := []byte(`{"op": "replace", "path": "/status/state", "value": "canceled"}`)

	var result interface{}
	patch(url, header, payload, &result)

	return nil
}
