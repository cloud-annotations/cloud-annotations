package mockwml

import (
	"encoding/json"
	"log"
	"time"
)

type TrainingRuns struct {
	Resources []Resources `json:"resources"`
}

type Metadata struct {
	GUID       string    `json:"guid"`
	URL        string    `json:"url"`
	CreatedAt  time.Time `json:"created_at"`
	ModifiedAt time.Time `json:"modified_at"`
}

type Framework struct {
	Name    string `json:"name"`
	Version string `json:"version"`
}

type ComputeConfiguration struct {
	Name string `json:"name"`
}

type Execution struct {
	Command              string               `json:"command"`
	ComputeConfiguration ComputeConfiguration `json:"compute_configuration"`
}

type ModelDefinition struct {
	Framework      Framework `json:"framework"`
	Name           string    `json:"name"`
	DefinitionHref string    `json:"definition_href"`
	Execution      Execution `json:"execution"`
}

type Connection struct {
	EndpointURL     string `json:"endpoint_url"`
	AccessKeyID     string `json:"access_key_id"`
	SecretAccessKey string `json:"secret_access_key"`
}

type DataLocation struct {
	Bucket string `json:"bucket"`
}

type TrainingDataReference struct {
	Type       string       `json:"type"`
	Connection Connection   `json:"connection"`
	Location   DataLocation `json:"location"`
}

type ResultLocation struct {
	Bucket        string `json:"bucket"`
	ModelLocation string `json:"model_location"`
}

type TrainingResultsReference struct {
	Type       string         `json:"type"`
	Connection Connection     `json:"connection"`
	Location   ResultLocation `json:"location"`
}

type Errors struct {
	Code     string `json:"code"`
	Message  string `json:"message"`
	MoreInfo string `json:"more_info"`
}

type Error struct {
	Trace  string   `json:"trace"`
	Errors []Errors `json:"errors"`
}

type Status struct {
	State       string        `json:"state"`
	FinishedAt  time.Time     `json:"finished_at"`
	SubmittedAt time.Time     `json:"submitted_at"`
	RunningAt   time.Time     `json:"running_at"`
	Error       Error         `json:"error"`
	Message     string        `json:"message"`
	Metrics     []interface{} `json:"metrics"`
	CurrentAt   time.Time     `json:"current_at"`
	ErrorCause  string        `json:"error_cause"`
}

type Entity struct {
	ModelDefinition          ModelDefinition          `json:"model_definition"`
	TrainingDataReference    TrainingDataReference    `json:"training_data_reference"`
	TrainingResultsReference TrainingResultsReference `json:"training_results_reference"`
	Status                   Status                   `json:"status"`
}

type Resources struct {
	Metadata Metadata `json:"metadata"`
	Entity   Entity   `json:"entity"`
}

func ListTrainingRuns() TrainingRuns {
	var runs TrainingRuns
	if err := json.Unmarshal(JsonData, &runs); err != nil {
		log.Println(err)
	}
	return runs
}
