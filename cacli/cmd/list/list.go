package list

import (
	"github.com/cloud-annotations/training/cacli/cmd/login"
	"github.com/cloud-annotations/training/cacli/e"
	"github.com/spf13/cobra"
)

func Run(cmd *cobra.Command, args []string) {
	session := login.AssertLoggedIn()

	models, err := session.ListTrainingRuns()
	if err != nil {
		e.Exit(err)
	}
	render(models)
}
