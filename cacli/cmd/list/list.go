package list

import (
	"github.com/cloud-annotations/training/cacli/cmd/login"
	"github.com/cloud-annotations/training/cacli/e"
	"github.com/spf13/cobra"
)

func Run(*cobra.Command, []string) {
	session := login.AssertLoggedIn()

	// TODO: needs to be sorted, also might have a date bug, said was 5 hours ago but was probably 5 min
	models, err := session.ListTrainingRuns()
	if err != nil {
		e.Exit(err)
	}
	render(models)
}
