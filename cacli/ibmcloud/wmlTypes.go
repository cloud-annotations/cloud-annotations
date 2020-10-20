package ibmcloud

import "time"

// NOTE: some of the timestamps are malformed and we don't care about dates, so parse them as strings.

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
	CurrentAt   string        `json:"current_at"`
}

type TrainingRun struct {
	ModelDefinition          ModelDefinition          `json:"model_definition"`
	TrainingDataReference    TrainingDataReference    `json:"training_data_reference"`
	TrainingResultsReference TrainingResultsReference `json:"training_results_reference"`
	Status                   Status                   `json:"status"`
}

type Model struct {
	Metadata Metadata    `json:"metadata"`
	Entity   TrainingRun `json:"entity"`
}

type Models struct {
	Resources []Model `json:"resources"`
}

type TrainingDefinition struct {
	Framework Framework `json:"framework"`
	Name      string    `json:"name"`
}

type Runtimes struct {
	Name    string `json:"name"`
	Version string `json:"version"`
}

type Framework struct {
	Name     string     `json:"name"`
	Version  string     `json:"version"`
	Runtimes []Runtimes `json:"runtimes"`
}

type ContentStatus struct {
	State string `json:"state"`
}

type TrainingDefinitionVersion struct {
	GUID          string        `json:"guid"`
	URL           string        `json:"url"`
	ContentURL    string        `json:"content_url"`
	ContentStatus ContentStatus `json:"content_status"`
}

type TrainingDef struct {
	Name                      string                    `json:"name"`
	Framework                 Framework                 `json:"framework"`
	TrainingDefinitionVersion TrainingDefinitionVersion `json:"training_definition_version"`
}

type TrainingDefinitionRes struct {
	Metadata Metadata    `json:"metadata"`
	Entity   TrainingDef `json:"entity"`
}

type TrainingScriptRes struct {
	Ok string `json:"ok"`
}

type SocketMessage struct {
	Status SocketMessageStatus `json:"status"`
}

type SocketMessageStatus struct {
	CurrentAt   time.Time `json:"current_at"`
	SubmittedAt time.Time `json:"submitted_at"`
	State       string    `json:"state"`
	Message     string    `json:"message"`
}
