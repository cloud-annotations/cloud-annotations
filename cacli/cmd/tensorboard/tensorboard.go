package tensorboard

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"strings"
	"syscall"

	"github.com/cloud-annotations/training/cacli/cmd/login"
	"github.com/cloud-annotations/training/cacli/e"
	"github.com/spf13/cobra"
)

func Run(cmd *cobra.Command, args []string) {
	if len(args) < 1 {
		e.Exit(errors.New("no `Model ID` provided\nUsage: cacli progress <model_id>"))
	}
	// verbose, err := cmd.Flags().GetBool("verbose")
	// if err != nil {
	// 	e.Exit(err)
	// }
	// config, err := cmd.Flags().GetString("config")
	// if err != nil {
	// 	e.Exit(err)
	// }

	modelID := args[0]

	session := login.AssertLoggedIn()

	model, err := session.GetTrainingRun(modelID)
	if err != nil {
		e.Exit(err)
	}

	bucket := model.Entity.TrainingResultsReference.Location.Bucket
	modelLocation := model.Entity.TrainingResultsReference.Location.ModelLocation

	s3endpoint, err := session.GetEndpointForBucket(bucket)
	s3endpoint = strings.ReplaceAll(s3endpoint, "https://", "")

	if err != nil {
		e.Exit(err)
	}

	// fmt.Println(bucket)
	// fmt.Println(modelLocation)
	// fmt.Println(s3endpoint)

	// fmt.Println(session.AccessKeyID)
	// fmt.Println(session.SecretAccessKey)

	binary, err := exec.LookPath("tensorboard")
	if err != nil {
		fmt.Println("tensorboard not installed")
	}
	fmt.Println(binary)

	// command := exec.Command("tensorboard", fmt.Sprintf("--logdir=s3://%s/%s", bucket, modelLocation))
	arguments := []string{"tensorboard", fmt.Sprintf("--logdir=s3://%s/%s", bucket, modelLocation)}
	env := os.Environ()
	env = append(env, fmt.Sprintf("AWS_ACCESS_KEY_ID=%s", session.AccessKeyID))
	env = append(env, fmt.Sprintf("AWS_SECRET_ACCESS_KEY=%s", session.SecretAccessKey))
	env = append(env, fmt.Sprintf("S3_ENDPOINT=%s", s3endpoint))
	env = append(env, "S3_USE_HTTPS=1")
	env = append(env, "S3_VERIFY_SSL=0")
	// command.Env = env

	syscall.Exec(binary, arguments, env)

	// cmdOut, err := command.StdoutPipe()
	// if err != nil {
	// 	e.Exit(err)
	// }

	// cmdErr, err := command.StderrPipe()
	// if err != nil {
	// 	e.Exit(err)
	// }

	// err = command.Start()
	// if err != nil {
	// 	e.Exit(err)
	// }

	// stdOutput, err := ioutil.ReadAll(cmdOut)
	// if err != nil {
	// 	e.Exit(err)
	// }

	// errOutput, err := ioutil.ReadAll(cmdErr)
	// if err != nil {
	// 	e.Exit(err)
	// }

	// err = command.Wait()
	// if err != nil {
	// 	e.Exit(err)
	// }

	// fmt.Printf("STDOUT: %s\n", stdOutput)

	// fmt.Printf("STDERR: %s\n", errOutput)
}
