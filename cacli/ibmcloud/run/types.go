package run

// NOTE: TrainingRun is very close to TrainingRun in wmlTypes.go but they are not compatible.

type TrainingRun struct {
	ModelDefinition          *ModelDefinition          `json:"model_definition"`
	TrainingDataReference    *TrainingDataReference    `json:"training_data_reference"`
	TrainingResultsReference *TrainingResultsReference `json:"training_results_reference"`
}

type ModelDefinition struct {
	Framework      *Framework `json:"framework"`
	Name           string     `json:"name"`
	Author         *Author    `json:"author"`
	DefinitionHref string     `json:"definition_href"`
	Execution      *Execution `json:"execution"`
}

type Framework struct {
	Name    string `json:"name"`
	Version string `json:"version"`
}

type Author struct {
}

type Execution struct {
	Command              string                `json:"command"`
	ComputeConfiguration *ComputeConfiguration `json:"compute_configuration"`
}

type ComputeConfiguration struct {
	Name string `json:"name"`
}

type TrainingDataReference struct {
	Connection *Connection `json:"connection"`
	Source     *Source     `json:"source"`
	Type       string      `json:"type"`
}

type TrainingResultsReference struct {
	Connection *Connection `json:"connection"`
	Target     *Target     `json:"target"`
	Type       string      `json:"type"`
}

type Connection struct {
	EndpointURL     string `json:"endpoint_url"`
	AccessKeyID     string `json:"access_key_id"`
	SecretAccessKey string `json:"secret_access_key"`
}

type Source struct {
	Bucket string `json:"bucket"`
}

type Target struct {
	Bucket string `json:"bucket"`
}
