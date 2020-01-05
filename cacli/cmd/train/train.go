package train

import (
	"fmt"
	"os"
	"strconv"
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

func Run(cmd *cobra.Command, args []string) {
	bucket := ""
	if len(args) >= 1 {
		bucket = args[0]
	}

	projectName, err := cmd.Flags().GetString("name")
	output, err := cmd.Flags().GetString("output")
	steps, err := cmd.Flags().GetInt("steps")
	stepsChanged := cmd.Flags().Changed("steps")
	gpu, err := cmd.Flags().GetString("gpu")
	script, err := cmd.Flags().GetString("script")

	framework, err := cmd.Flags().GetString("framework")
	frameworkVersion, err := cmd.Flags().GetString("frameworkv")
	pythonVersion, err := cmd.Flags().GetString("pythonv")

	if err != nil {
		e.Exit(err)
	}

	session := login.AssertLoggedIn()

	if bucket == "" {
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

	fmt.Println()

	var trainingBucket *s3.BucketExtended = nil
	var outputBucket *s3.BucketExtended = nil

	// Ask for a bucket.
	if bucket == "" {
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
	} else {
		// check the provided bucket
		for _, element := range bucketList.Buckets {
			if *element.Name == bucket {
				trainingBucket = element
			}
		}
		if trainingBucket == nil {
			e.Exit(fmt.Errorf("%s: bucket does not exist", text.Colors{text.FgCyan, text.Bold}.Sprintf(bucket)))
		}
		fmt.Println("Bucket " + text.Colors{text.FgCyan, text.Bold}.Sprintf(bucket))
		fmt.Println()
	}

	if output != "" {
		// check the provided bucket
		for _, element := range bucketList.Buckets {
			if *element.Name == output {
				outputBucket = element
			}
		}
		if outputBucket == nil {
			e.Exit(fmt.Errorf("%s: bucket does not exist", text.Colors{text.FgCyan, text.Bold}.Sprintf(output)))
		}
		fmt.Println("Output " + text.Colors{text.FgCyan, text.Bold}.Sprintf(output))
		fmt.Println()
	}

	s.Suffix = " Starting training run..."
	s.Start()

	if projectName == "" {
		projectName = *trainingBucket.Name
	}
	if stepsChanged {
		// if non default steps, include it in project name.
		projectName = projectName + " (" + strconv.Itoa(steps) + ")"
	}
	model, err := session.StartTraining(script, projectName, trainingBucket, outputBucket, steps, gpu, framework, frameworkVersion, pythonVersion)
	if err != nil {
		e.Exit(err)
	}
	s.Stop()

	modelID := model.Metadata.GUID
	border := strings.Repeat("─", len(modelID))
	fmt.Println("Model ID:")
	fmt.Printf("┌─%s─┐\n", border)
	fmt.Printf("│ %s │\n", text.Colors{text.FgCyan, text.Bold}.Sprintf(modelID))
	fmt.Printf("└─%s─┘\n", border)
	fmt.Println()

	fmt.Println(text.FgGreen.Sprintf("success"), "training run submitted")
}
