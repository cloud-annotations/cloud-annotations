package cancel

import (
	"errors"
	"fmt"
	"time"

	"github.com/briandowns/spinner"
	"github.com/cloud-annotations/training/cacli/cmd/login"
	"github.com/cloud-annotations/training/cacli/e"
	"github.com/cloud-annotations/training/cacli/ibmcloud"
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
		err = loading(modelID, session)
		if err != nil {
			e.Exit(errors.New("failed to cancel training"))
		}
		fmt.Println("Training canceled")
	default:
		// means we gave a bad model id.
		e.Exit(errors.New("TODO: GetTrainingRun didn't return with a valid state"))
	}

}

func loading(modelID string, session *ibmcloud.CredentialSession) error {
	s := spinner.New(spinner.CharSets[14], 60*time.Millisecond)
	s.Suffix = " Attempting to cancel training... May take a minute or two..."
	s.Start()
	defer s.Stop()
	return session.CancelRun(modelID)
}
