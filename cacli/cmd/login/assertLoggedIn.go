package login

import (
	"fmt"
	"os"
	"time"

	"github.com/briandowns/spinner"
	"github.com/cloud-annotations/training/cacli/e"
	"github.com/cloud-annotations/training/cacli/ibmcloud"
	"github.com/jedib0t/go-pretty/text"
	homedir "github.com/mitchellh/go-homedir"
)

func AssertLoggedIn() *ibmcloud.AccountSession {
	s := spinner.New(spinner.CharSets[14], 60*time.Millisecond)
	s.Suffix = " Checking login..."
	s.Start()
	defer s.Stop()

	home, err := homedir.Dir()
	if err != nil {
		e.Exit(err)
	}

	// TODO: use some sort of global config for this path.
	accountSession, err := ibmcloud.AuthenticateFromFile(home + "/.cacli/credentials.json")
	if err != nil {
		fmt.Println(text.Colors{text.FgRed, text.Bold}.Sprintf("FAILED"))
		fmt.Println("Not logged in. Use '" + text.Colors{text.FgCyan, text.Bold}.Sprintf("cacli login") + "' to log in.")
		os.Exit(1)
	}

	return accountSession
}
