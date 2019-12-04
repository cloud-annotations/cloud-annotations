package list

import (
	"time"

	"github.com/briandowns/spinner"
	"github.com/cloud-annotations/training/cacli/cmd/login"
	"github.com/cloud-annotations/training/cacli/e"
	"github.com/spf13/cobra"
)

func Run(*cobra.Command, []string) {
	s := spinner.New(spinner.CharSets[14], 60*time.Millisecond)
	s.Suffix = " Checking login..."
	s.Start()
	session := login.AssertLoggedIn()
	s.Stop()

	models, err := session.ListTrainingRuns()
	if err != nil {
		e.Exit(err)
	}
	render(models)
}
