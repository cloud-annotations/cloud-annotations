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

		// location := model.Entity.TrainingResultsReference.Location
		// bucket := location.Bucket
		// modelLocation := location.ModelLocation

		// const { region, access_key_id, secret_access_key } = config.credentials.cos
		// const cosConfig = {
		//   endpoint: cosEndpointBuilder(region, true),
		//   accessKeyId: access_key_id,
		//   secretAccessKey: secret_access_key
		// }
		// const cos = new COS.S3(cosConfig)
		// let downloads = []

		// if (ops.coreml) {
		//   downloads.push(
		//     downloadDir(cos, bucket, model_location, ops.model_id, 'model_ios')
		//   )
		// }
		// if (ops.tflite) {
		//   downloads.push(
		//     downloadDir(cos, bucket, model_location, ops.model_id, 'model_android')
		//   )
		// }
		// if (ops.tfjs) {
		//   downloads.push(
		//     downloadDir(cos, bucket, model_location, ops.model_id, 'model_web')
		//   )
		// }

		// // Default, download everything.
		// if (downloads.length === 0) {
		//   downloads.push(downloadDir(cos, bucket, model_location, ops.model_id, ''))
		// }

		// await Promise.all(downloads)

		s.Stop()
		fmt.Println(text.Colors{text.FgGreen}.Sprintf("success") + " download complete")
	}
}
