package ibmcloud

import (
	"encoding/json"
	"io"
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

	var result = &Model{}
	err := Fetch(endpoint, header, result)
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
	err := Fetch(endpoint, header, result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func postModel(url string, token string, instanceID string, trainingRun *TrainingRun) (*Model, error) {
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
	err = PostBody(endpoint, header, jsonValue, result)
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

	var result = &TrainingDefinitionRes{}
	err = PostBody(endpoint, header, jsonValue, result)
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

	var result = &TrainingScriptRes{}
	err := FileUpload(url, header, body, result)
	if err != nil {
		return nil, err
	}

	return result, nil
}
