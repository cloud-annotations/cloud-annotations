package progress

import (
	"errors"
	"fmt"
	"os"
	"os/signal"
	"regexp"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/briandowns/spinner"
	"github.com/cheggaaa/pb"
	"github.com/cloud-annotations/training/cacli/cmd/login"
	"github.com/cloud-annotations/training/cacli/e"
	"github.com/spf13/cobra"
)

var s = spinner.New(spinner.CharSets[14], 60*time.Millisecond)

func Run(_ *cobra.Command, args []string) {
	if len(args) < 1 {
		e.Exit(errors.New("no `Model ID` provided\nUsage: cacli progress <model_id>"))
	}

	modelID := args[0]

	session := login.AssertLoggedIn()

	s.Suffix = " Checking training status..."
	s.Start()

	model, err := session.GetTrainingRun(modelID)
	if err != nil {
		e.Exit(err)
	}

	switch model.Entity.Status.State {
	case "completed", "error", "failed", "canceled":
		s.Stop()
		fmt.Println("✨ Done.")
		os.Exit(0)
	case "pending", "running":
		// do nothing
	default:
		// means we gave a bad model id.
		e.Exit(errors.New("TODO: GetTrainingRun didn't return with a valid state"))
	}

	count := 1000 //TODO: get step count
	bar := pb.New(count)
	template := `{{ bar . "[" "#" "-" "-" "]"}} {{counters . "%s/%s"}} {{rtime . "| ETA: %s"}}`
	bar.SetTemplateString(template)

	//     const classificationStepRegex = /Step (\d*): Train accuracy/gm
	//     const rateRegex = /tensorflow:global_step\/sec: ([\d.]*)/gm
	//     const successRegex = /CACLI-TRAINING-SUCCESS/gm
	//     const trainingFailedRegex = /CACLI-TRAINING-FAILED/gm
	//     const conversionFailedRegex = /CACLI-CONVERSION-FAILED/gm
	//const totalStepsRegex = /\.\/start\.sh (\d*)$/
	objectDetectionStepRegex, err := regexp.Compile(`tensorflow:loss = [\d.]*, step = (\d*)`)
	trainingRegex, err := regexp.Compile(`^training-[^:]*:(.*)`)
	if err != nil {
		e.Exit(err)
	}

	trainingSteps := 0
	hasStartedPreparing := model.Entity.Status.State == "running"
	hasStartedTraining := false
	startTime := time.Now()
	err = session.MonitorRun(modelID, func(message string) {
		if !hasStartedPreparing {
			// If we haven't gotten any training messages yet, check to see if we do now.
			regRes := trainingRegex.FindStringSubmatch(message)
			if len(regRes) >= 2 && strings.TrimSpace(regRes[1]) != "" {
				hasStartedPreparing = true
				s.Stop()
				// move on to check for training steps.
			} else {
				// If it's been 10 seconds of nothing, show waiting for GPU message.
				nowTime := time.Now()
				if nowTime.Sub(startTime).Seconds() > 10 {
					s.Suffix = " Waiting for an available GPU (this may take a while)..."
					s.Start()
				}
				return
			}
		}

		// check for steps.
		regRes := objectDetectionStepRegex.FindStringSubmatch(message)
		if len(regRes) >= 2 {
			tmpTrainingSteps, err := strconv.Atoi(regRes[1])
			if err != nil {
				return // ignore, not fatal.
			}
			// disregard output until we know there wasn't an error.
			trainingSteps = tmpTrainingSteps
			hasStartedTraining = true
			s.Stop()

			fmt.Print("\033[?25l")
			c := make(chan os.Signal, 1)
			signal.Notify(c, os.Interrupt, syscall.SIGTERM)
			go func() {
				<-c
				fmt.Print("\033[?25h")
				os.Exit(1)
			}()
			bar.Start()
		}

		// if there are training steps, update progress.
		if hasStartedTraining {
			// avoids to many state calculations.
			if bar.Current() < int64(trainingSteps) {
				bar.SetCurrent(int64(trainingSteps))
			}
			fmt.Println()
			fmt.Println(model.Entity.Status.RunningAt)
			fmt.Println(time.Now())
			elapsedSeconds := int(time.Now().Sub(model.Entity.Status.RunningAt).Seconds())
			fmt.Println(elapsedSeconds)
			fmt.Println((elapsedSeconds / trainingSteps) * (1000 - trainingSteps))
			// TODO: somehow apply rate information from started at date.
			return
		}

		// otherwise show preparing to train message.
		s.Suffix = " Training has starting, waiting for step information..."
		s.Start()
		return
	})
	if err != nil {
		e.Exit(err)
	}

	bar.Finish()
	fmt.Print("\033[?25h")
}
