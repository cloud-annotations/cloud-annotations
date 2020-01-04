package tensorboard

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"strings"
	"syscall"
	"time"

	"github.com/briandowns/spinner"
	"github.com/cloud-annotations/training/cacli/cmd/login"
	"github.com/cloud-annotations/training/cacli/e"
	"github.com/spf13/cobra"
)

var s = spinner.New(spinner.CharSets[14], 60*time.Millisecond)

func Run(cmd *cobra.Command, args []string) {
	if len(args) < 1 {
		e.Exit(errors.New("no `Model ID` provided\nUsage: cacli tensorboard <model_id>"))
	}

	modelID := args[0]

	session := login.AssertLoggedIn()

	s.Suffix = " Getting TensorBoard information..."
	s.Start()

	model, err := session.GetTrainingRun(modelID)
	if err != nil {
		e.Exit(err)
	}

	bucket := model.Entity.TrainingResultsReference.Location.Bucket
	modelLocation := model.Entity.TrainingResultsReference.Location.ModelLocation

	s3endpoint, err := session.GetEndpointForBucket(bucket)
	if err != nil {
		e.Exit(err)
	}
	s3endpoint = strings.ReplaceAll(s3endpoint, "https://", "")

	binary, err := exec.LookPath("tensorboard")
	if err != nil {
		e.Exit(errors.New("tensorboard not installed"))
	}

	logdir := fmt.Sprintf("s3://%s/%s", bucket, modelLocation)
	arguments := []string{"tensorboard", "--logdir", logdir}
	env := os.Environ()
	env = append(env, fmt.Sprintf("AWS_ACCESS_KEY_ID=%s", session.AccessKeyID))
	env = append(env, fmt.Sprintf("AWS_SECRET_ACCESS_KEY=%s", session.SecretAccessKey))
	env = append(env, fmt.Sprintf("S3_ENDPOINT=%s", s3endpoint))
	env = append(env, "TF_CPP_MIN_LOG_LEVEL=3")

	syscall.Exec(binary, arguments, env)
}
