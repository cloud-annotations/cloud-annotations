package download

import (
	"errors"
	"fmt"
	"time"

	"github.com/briandowns/spinner"
	"github.com/cloud-annotations/training/cacli/e"
	"github.com/jedib0t/go-pretty/text"

	"github.com/cloud-annotations/training/cacli/cmd/login"
	"github.com/spf13/cobra"
)

var s = spinner.New(spinner.CharSets[14], 60*time.Millisecond)

func Run(cmd *cobra.Command, args []string) {
	if len(args) < 1 {
		e.Exit(errors.New("no `Model ID` provided\nUsage: cacli download <model_id>"))
	}
	modelID := args[0]

	tensorflowJS, err := cmd.Flags().GetBool("tfjs")
	tensorflowlite, err := cmd.Flags().GetBool("tflite")
	coreML, err := cmd.Flags().GetBool("coreml")
	if err != nil {
		e.Exit(err)
	}

	session := login.AssertLoggedIn()

	s.Suffix = " Downloading model..."
	s.Start()

	model, err := session.GetTrainingRun(modelID)
	if err != nil {
		e.Exit(err)
	}

	switch model.Entity.Status.State {
	case "pending", "running":
		s.Stop()
		e.Exit(errors.New("model is still training"))
	case "completed":
		// do nothing
	case "error", "failed", "canceled":
		fmt.Println(text.Colors{text.FgYellow}.Sprintf("warning") + " training was canceled or failed")
	default:
		s.Stop()
		e.Exit(errors.New("invalid training run state"))
	}

	modelsToDownload := []string{}
	if tensorflowJS {
		modelsToDownload = append(modelsToDownload, "/model_web")
	}
	if tensorflowlite {
		modelsToDownload = append(modelsToDownload, "/model_android")
	}
	if coreML {
		modelsToDownload = append(modelsToDownload, "/model_ios")
	}

	location := model.Entity.TrainingResultsReference.Location
	bucket := location.Bucket
	modelLocation := location.ModelLocation
	err = session.DownloadDirs(bucket, modelLocation, modelID, modelsToDownload)
	if err != nil {
		e.Exit(err)
	}

	s.Stop()
	fmt.Println(text.Colors{text.FgGreen}.Sprintf("success") + " download complete")
}
