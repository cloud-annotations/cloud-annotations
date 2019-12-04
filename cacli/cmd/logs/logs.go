package logs

import (
	"errors"
	"os"

	"github.com/cloud-annotations/training/cacli/e"

	"github.com/cloud-annotations/training/cacli/cmd/login"
	"github.com/spf13/cobra"
)

func Run(cmd *cobra.Command, args []string) {
	if len(args) < 1 {
		e.Exit(errors.New("No Model ID provided\nUsage: cacli logs <model_id>"))
	}
	modelID := args[0]

	session := login.AssertLoggedIn()

	model, err := session.GetTrainingRun(modelID)
	if err != nil {
		e.Exit(err)
	}

	switch model.Entity.Status.State {
	case "completed", "error", "failed", "canceled":
		// TODO: pull from object storage.
		os.Exit(0)
	}

	session.SocketToMe(modelID)
}
