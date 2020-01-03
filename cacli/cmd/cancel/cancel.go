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

	model, err := session.GetTrainingRun(modelID)
	if err != nil {
		e.Exit(err)
	}

	switch model.Entity.Status.State {
	case "completed", "error", "failed", "canceled":
		fmt.Println("training status : ", model.Entity.Status.State)
		e.Exit(err)
	case "pending", "running":
		// cancel
		s := spinner.New(spinner.CharSets[14], 60*time.Millisecond)
		s.Suffix = " Cancelling training run..."
		s.Start()
		err = session.CancelRun(modelID)
		s.Stop()
		if err != nil {
			e.Exit(errors.New("failed to cancel training"))
		}
		fmt.Println(text.Colors{text.FgGreen}.Sprintf("success") + " training canceled")

	default:
		// means we gave a bad model id.
		e.Exit(errors.New("TODO: GetTrainingRun didn't return with a valid state"))
	}
}
