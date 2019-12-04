package logs

import (
	"time"

	"github.com/briandowns/spinner"
	"github.com/cloud-annotations/training/cacli/cmd/login"
	"github.com/spf13/cobra"
)

func Run(cmd *cobra.Command, args []string) {
	s := spinner.New(spinner.CharSets[14], 60*time.Millisecond)
	s.Suffix = " Checking login..."
	s.Start()
	session := login.AssertLoggedIn()
	s.Stop()
	// TODO: check if arg is there.
	session.Sockittoome(args[0])
}
