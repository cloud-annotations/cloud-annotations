package logs

import (
	"errors"

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

	session.Sockittoome(modelID)
}
