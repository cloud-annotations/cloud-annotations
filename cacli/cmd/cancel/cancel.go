package cancel

import (
	"errors"

	"github.com/cloud-annotations/training/cacli/cmd/login"
	"github.com/cloud-annotations/training/cacli/e"
	"github.com/spf13/cobra"
)

func Run(cmd *cobra.Command, args []string) {
	if len(args) < 1 {
		e.Exit(errors.New("no `Model ID` provided\nUsage: cacli download <model_id>"))
	}

	modelID := args[0]

	session := login.AssertLoggedIn()

	model, err := session.GetTrainingRun(modelID)
	if err != nil {
		e.Exit(err)
	}

	switch model.Entity.Status.State {
	case "completed", "error", "failed", "canceled":
		// do nothing
		e.Exit(errors.New("Can not cancel training. use 'cacli list' to check status"))
	case "pending", "running":
		// cancel
		err = session.CancelRun(modelID)
		if err != nil {
			e.Exit(errors.New("failed to cancel training"))
		}
	default:
		// means we gave a bad model id.
		e.Exit(errors.New("TODO: GetTrainingRun didn't return with a valid state"))
	}

}
