package list

import (
	"github.com/cloud-annotations/training/cacli/mockwml"
	"github.com/spf13/cobra"
)

func Run(*cobra.Command, []string) {
	runs := mockwml.ListTrainingRuns()
	render(runs)
}
