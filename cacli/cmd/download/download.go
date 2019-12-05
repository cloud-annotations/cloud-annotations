package download

import (
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/briandowns/spinner"
	"github.com/cloud-annotations/training/cacli/e"
	"github.com/jedib0t/go-pretty/text"

	"github.com/cloud-annotations/training/cacli/cmd/login"
	"github.com/spf13/cobra"
)

var s = spinner.New(spinner.CharSets[14], 60*time.Millisecond)

func Run(tensorflowJS *bool, tensorflowlite *bool, coreML *bool) func(*cobra.Command, []string) {
	return func(cmd *cobra.Command, args []string) {
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
		case "pending", "running":
			fmt.Println("model is still training")
			os.Exit(0)
		case "completed":
			// do nothing
		case "error", "failed", "canceled":
			e.Exit(errors.New("training was canceled or failed"))
		default:
			e.Exit(errors.New("TODO: GetTrainingRun didn't return with a valid state"))
		}

		s.Suffix = " Downloading model..."
		s.Start()

		modelsToDownload := []string{}
		if *tensorflowJS {
			modelsToDownload = append(modelsToDownload, "model_web")
		}
		if *tensorflowlite {
			modelsToDownload = append(modelsToDownload, "model_android")
		}
		if *coreML {
			modelsToDownload = append(modelsToDownload, "model_ios")
		}

		location := model.Entity.TrainingResultsReference.Location
		bucket := location.Bucket
		modelLocation := location.ModelLocation
		session.DownloadDirs(bucket, modelLocation, modelID, modelsToDownload)

		s.Stop()
		fmt.Println(text.Colors{text.FgGreen}.Sprintf("success") + " download complete")
	}
}
