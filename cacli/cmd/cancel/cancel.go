package cancel

import (
	"errors"
	"fmt"
	"time"

	"github.com/briandowns/spinner"
	"github.com/cloud-annotations/training/cacli/cmd/login"
	"github.com/cloud-annotations/training/cacli/e"
	"github.com/jedib0t/go-pretty/text"
	"github.com/spf13/cobra"
)

func Run(cmd *cobra.Command, args []string) {
	if len(args) < 1 {
		e.Exit(errors.New("no `Model ID` provided\nUsage: cacli cancel <model_id>"))
	}

	modelID := args[0]

	session := login.AssertLoggedIn()
	s := spinner.New(spinner.CharSets[14], 60*time.Millisecond)
	s.Suffix = " Canceling training run..."
	s.Start()
	model, err := session.GetTrainingRun(modelID)
	if err != nil {
		e.Exit(err)
	}

	switch model.Entity.Status.State {
	case "completed", "canceled":
		s.Stop()
		e.Exit(fmt.Errorf("can not cancel an already %s training run", model.Entity.Status.State))
	case "error", "failed":
		s.Stop()
		e.Exit(errors.New("can not cancel an already failed training run"))
	case "pending", "running":
		// cancel
		err = session.CancelRun(modelID)
		s.Stop()
		if err != nil {
			e.Exit(errors.New("failed to cancel training"))
		}
		fmt.Println(text.Colors{text.FgGreen}.Sprintf("success") + " training canceled")

	default:
		s.Stop()
		e.Exit(errors.New("invalid training run state"))
	}
}
