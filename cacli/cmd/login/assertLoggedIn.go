package login

import (
	"fmt"
	"log"
	"os"

	"github.com/cloud-annotations/training/cacli/ibmcloud"
	"github.com/jedib0t/go-pretty/text"
	homedir "github.com/mitchellh/go-homedir"
)

func AssertLoggedIn() {
	// Only refresh the persisted token.
	home, err := homedir.Dir()
	if err != nil {
		log.Fatalln(err)
	}
	ibmcloud.AuthenticateFromFile(home + "/.cacli/credentials.json")

	// most common sense issue: the watson machine learning instance was deleted since log in.
	// QUESTION: should we waste time checking?
	// QUESTION: should we even get the hmac credentials here?
	// - it would be awkward to pass them back...
	// - we don't need them for most commands.
	// CONCLUSION: let's not check.

	fmt.Println(text.Colors{text.FgRed, text.Bold}.Sprintf("FAILED"))
	fmt.Println("Not logged in. Use '" + text.Colors{text.FgCyan, text.Bold}.Sprintf("cacli login") + "' to log in.")
	os.Exit(1)

	// return an account session.
}
