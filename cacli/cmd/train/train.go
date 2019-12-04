package train

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/briandowns/spinner"
	"github.com/cloud-annotations/training/cacli/cmd/login"
	"github.com/cloud-annotations/training/cacli/e"
	"github.com/cloud-annotations/training/cacli/talkdirtytome"
	"github.com/jedib0t/go-pretty/text"
	"github.com/spf13/cobra"
)

func Run(cmd *cobra.Command, args []string) {
	s := spinner.New(spinner.CharSets[14], 60*time.Millisecond)
	s.Suffix = " Checking login..."
	s.Start()
	session := login.AssertLoggedIn()
	s.Stop()

	s.Suffix = " Loading buckets..."
	s.Start()
	bucketList, err := session.ListAllBucket()
	if err != nil {
		e.Exit(err)
	}
	s.Stop()

	// Ask for a bucket.
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

	s.Suffix = " Starting training run..."
	s.Start()
	// TODO: allow passing path to training zip.
	// TODO: allow custom step and gpu
	model, err := session.StartTraining("", bucketList.Buckets[bucketIndex], 500, "k80")
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

	fmt.Println(text.FgGreen.Sprintf("success"), "Training run submitted.")
	fmt.Println()

	modelID := model.Metadata.GUID
	border := strings.Repeat("─", len(modelID))
	fmt.Println("Model ID:")
	fmt.Printf("┌─%s─┐\n", border)
	fmt.Printf("│ %s │\n", text.Colors{text.FgCyan, text.Bold}.Sprintf(modelID))
	fmt.Printf("└─%s─┘\n", border)
	fmt.Println()

	shouldMonitor := false
	if err := talkdirtytome.YesOrNah("would you like to monitor progress?", &shouldMonitor); err != nil {
		if err.Error() == "interrupt" {
			os.Exit(1)
		} else {
			e.Exit(err)
		}
	}

	if shouldMonitor {
		fmt.Println()
		// start monitor.
	}
}
