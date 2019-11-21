package wml

import "time"

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

type Location struct {
	Bucket        string `json:"bucket"`
	ModelLocation string `json:"model_location"`
}

type TrainingDataReference struct {
	Type       string     `json:"type"`
	Connection Connection `json:"connection"`
	Location   Location   `json:"location"`
}

type TrainingResultsReference struct {
	Type       string     `json:"type"`
	Connection Connection `json:"connection"`
	Location   Location   `json:"location"`
}

type Status struct {
	State       string        `json:"state"`
	FinishedAt  time.Time     `json:"finished_at"`
	SubmittedAt time.Time     `json:"submitted_at"`
	RunningAt   time.Time     `json:"running_at"`
	Message     string        `json:"message"`
	Metrics     []interface{} `json:"metrics"`
	CurrentAt   time.Time     `json:"current_at"`
}

type Entity struct {
	ModelDefinition          ModelDefinition          `json:"model_definition"`
	TrainingDataReference    TrainingDataReference    `json:"training_data_reference"`
	TrainingResultsReference TrainingResultsReference `json:"training_results_reference"`
	Status                   Status                   `json:"status"`
}

type Model struct {
	Metadata Metadata `json:"metadata"`
	Entity   Entity   `json:"entity"`
}

type Models struct {
	Resources []Model `json:"resources"`
}
