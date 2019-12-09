package train

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/IBM/ibm-cos-sdk-go/service/s3"
	"github.com/briandowns/spinner"
	"github.com/cloud-annotations/training/cacli/cmd/login"
	"github.com/cloud-annotations/training/cacli/e"
	"github.com/cloud-annotations/training/cacli/talkdirtytome"
	"github.com/jedib0t/go-pretty/text"
	"github.com/spf13/cobra"
)

var s = spinner.New(spinner.CharSets[14], 60*time.Millisecond)

// This is kinda gross.
func Run(bucket *string, steps *int, gpu *string) func(*cobra.Command, []string) {
	return func(cmd *cobra.Command, args []string) {
		session := login.AssertLoggedIn()

		if *bucket == "" {
			s.Suffix = " Loading buckets..."
		} else {
			s.Suffix = " Checking bucket..."
		}
		s.Start()
		bucketList, err := session.ListAllBucket()
		if err != nil {
			e.Exit(err)
		}
		s.Stop()

		var trainingBucket *s3.BucketExtended = nil
		for _, element := range bucketList.Buckets {
			if *element.Name == *bucket {
				trainingBucket = element
			}
		}

		// Ask for a bucket.
		if trainingBucket == nil {
			var bucketNames []string
			for _, element := range bucketList.Buckets {
				bucketNames = append(bucketNames, *element.Name)
			}
			bucketIndex := 0
			if err := talkdirtytome.ImportantList("Bucket", bucketNames, &bucketIndex); err != nil {
				if err.Error() == "interrupt" {
					os.Exit(1)
				} else {
					e.Exit(err)
				}
			}

			fmt.Println()
			trainingBucket = bucketList.Buckets[bucketIndex]
		}

		s.Suffix = " Starting training run..."
		s.Start()
		// TODO: allow passing path to training zip.
		// TODO: allow project name and output bucket.
		model, err := session.StartTraining("", trainingBucket, *steps, *gpu)
		if err != nil {
			e.Exit(err)
		}
		s.Stop()

		// NOTE: the spinner can be a bit buggy and do this:
		//
		// success Training run submitted.
		//
		// Model ID:
		// ┌────────────────┐
		// ⠦ Starting training run... │ model-iaa0w3y9 │
		// └────────────────┘

		modelID := model.Metadata.GUID
		border := strings.Repeat("─", len(modelID))
		fmt.Println("Model ID:")
		fmt.Printf("┌─%s─┐\n", border)
		fmt.Printf("│ %s │\n", text.Colors{text.FgCyan, text.Bold}.Sprintf(modelID))
		fmt.Printf("└─%s─┘\n", border)
		fmt.Println()

		fmt.Println(text.FgGreen.Sprintf("success"), "training run submitted")
	}
}
