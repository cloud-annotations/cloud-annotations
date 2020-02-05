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
	"github.com/jedib0t/go-pretty/text"
	"github.com/spf13/cobra"
	"nhooyr.io/websocket"
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
	case "completed":
		s.Stop()
		fmt.Println(text.Colors{text.FgGreen}.Sprintf("success") + " training complete")
		os.Exit(0)
	case "error", "failed", "canceled":
		s.Stop()
		e.Exit(errors.New("training failed or canceled"))
	case "pending", "running":
		// do nothing
	default:
		s.Stop()
		e.Exit(errors.New("invalid training run state"))
	}

	totalStepsRegex, err := regexp.Compile(`\.\/start\.sh (\d*)$`)
	if err != nil {
		e.Exit(err)
	}
	trainingCommand := model.Entity.ModelDefinition.Execution.Command
	totalStepCount := 0
	stepRegRes := totalStepsRegex.FindStringSubmatch(trainingCommand)
	if len(stepRegRes) >= 2 {
		totalStepCount, err = strconv.Atoi(stepRegRes[1])
		if err != nil {
			e.Exit(err)
		}
	}

	// GROSSSSSS, but okay...
	var theRate float64
	pointerToTheRate := &theRate
	var ElementRemainingTime pb.ElementFunc = func(state *pb.State, args ...string) string {
		baseString := "| ETA: "
		sp := *pointerToTheRate
		if !state.IsFinished() {
			if sp > 0 {
				remain := float64(state.Total() - state.Value())
				remainDur := time.Duration(remain/sp) * time.Second
				rts := remainDur

				hours := int(rts.Hours())
				minutes := int(rts.Minutes())
				seconds := int(rts.Seconds())
				if hours > 0 {
					return baseString + strconv.Itoa(hours) + " hrs"
				}
				if minutes > 0 {
					return baseString + strconv.Itoa(minutes) + " mins"
				}
				return baseString + strconv.Itoa(seconds) + " sec"
			}
		}
		return baseString + "???"
	}
	pb.RegisterElement("rtime", ElementRemainingTime, false)

	bar := pb.New(totalStepCount)
	template := `{{ bar . "[" "#" "-" "-" "]"}} {{counters . "%s/%s"}} {{rtime . "| ETA: %s"}}`
	bar.SetTemplateString(template)

	// const classificationStepRegex = /Step (\d*): Train accuracy/gm
	objectDetectionStepRegex, err := regexp.Compile(`tensorflow:loss = [\d.]*, step = (\d*)`)
	successRegex, err := regexp.Compile(`CACLI-TRAINING-SUCCESS`)
	trainingFailedRegex, err := regexp.Compile(`CACLI-TRAINING-FAILED`)
	conversionFailedRegex, err := regexp.Compile(`CACLI-CONVERSION-FAILED`)
	trainingRegex, err := regexp.Compile(`^training-[^:]*:(.*)`)
	if err != nil {
		e.Exit(err)
	}

	trainingSteps := 0
	hasStartedPreparing := model.Entity.Status.State == "running"
	hasStartedTraining := false
	timeWeStartedToMonitor := time.Now()

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
				if nowTime.Sub(timeWeStartedToMonitor).Seconds() > 10 {
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
			trainingSteps = tmpTrainingSteps + 1 // indexed by zero.

			if !hasStartedTraining {
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
		}

		isSuccess := len(successRegex.FindStringSubmatch(message)) > 2
		if isSuccess {
			bar.Finish()
			fmt.Print("\033[?25h")
			fmt.Println(text.Colors{text.FgGreen}.Sprintf("success") + " training complete")
			s.Suffix = " Generating model files..."
			s.Start()
			return
		}

		isTrainingFail := len(trainingFailedRegex.FindStringSubmatch(message)) > 2
		if isTrainingFail {
			bar.Finish()
			fmt.Print("\033[?25h")
			e.Exit(errors.New("training failed"))
		}

		isConversionFail := len(conversionFailedRegex.FindStringSubmatch(message)) > 2
		if isConversionFail {
			bar.Finish()
			fmt.Print("\033[?25h")
			e.Exit(errors.New("conversion failed"))
		}

		// if there are training steps, update progress.
		if hasStartedTraining {
			// avoids to many state calculations.
			if bar.Current() < int64(trainingSteps) {
				bar.SetCurrent(int64(trainingSteps))
			}

			// We have old information, update it.
			if model.Entity.Status.State != "running" {
				model, err = session.GetTrainingRun(modelID)
				if err != nil {
					e.Exit(err)
				}
			}

			startedAt := model.Entity.Status.RunningAt
			now := time.Now().UTC()
			elapsedSeconds := float64(now.Sub(startedAt).Seconds())
			if elapsedSeconds > 0 {
				theRate = float64(trainingSteps) / elapsedSeconds
			}
			return
		}

		// otherwise show preparing to train message.
		s.Suffix = " Training has started, waiting for a progress update..."
		s.Start()
		return
	})
	if websocket.CloseStatus(err) == websocket.StatusNormalClosure {
		fmt.Print("\033[?25h")
		s.Stop()
		fmt.Println(text.Colors{text.FgGreen}.Sprintf("success") + " model files saved to bucket")
		return
	}
	if err != nil {
		e.Exit(err)
	}
}
