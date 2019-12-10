package logs

import (
	"errors"
	"fmt"
	"os"

	"github.com/cloud-annotations/training/cacli/e"
	"github.com/jedib0t/go-pretty/text"
	"nhooyr.io/websocket"

	"github.com/cloud-annotations/training/cacli/cmd/login"
	"github.com/spf13/cobra"
)

func Run(cmd *cobra.Command, args []string) {
	if len(args) < 1 {
		e.Exit(errors.New("no `Model ID` provided\nUsage: cacli logs <model_id>"))
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
	case "pending", "running":
		// do nothing
	default:
		e.Exit(errors.New("TODO: GetTrainingRun didn't return with a valid state"))
	}

	err = session.MonitorRun(modelID, func(message string) {
		fmt.Println(message)
	})
	if websocket.CloseStatus(err) == websocket.StatusNormalClosure {
		fmt.Println(text.Colors{text.FgGreen}.Sprintf("success") + " log monitor done")
		return
	}
	if err != nil {
		e.Exit(err)
	}
}
