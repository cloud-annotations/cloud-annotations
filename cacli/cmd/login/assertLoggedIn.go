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
	"github.com/spf13/viper"
)

func isSet(item interface{}) bool {
	return item != nil && item != ""
}

func AssertLoggedIn() *ibmcloud.CredentialSession {
	s := spinner.New(spinner.CharSets[14], 60*time.Millisecond)
	s.Suffix = " Checking login..."
	s.Start()
	defer s.Stop()

	wmlInstanceID := viper.Get("wml_instance_id").(string)
	wmlAPIKey := viper.Get("wml_api_key").(string)
	wmlURL := viper.Get("wml_url").(string)
	cosAccessKey := viper.Get("cos_access_key").(string)
	cosSecretKey := viper.Get("cos_secret_key").(string)
	if isSet(wmlInstanceID) && isSet(wmlAPIKey) && isSet(wmlURL) && isSet(cosAccessKey) && isSet(cosSecretKey) {
		credentialSession, err := ibmcloud.AuthenticateFromCredentials(wmlInstanceID, wmlAPIKey, wmlURL, cosAccessKey, cosSecretKey)
		if err != nil {
			s.Stop()
			e.Exit(err)
		}
		return credentialSession
	}

	home, err := homedir.Dir()
	if err != nil {
		s.Stop()
		e.Exit(err)
	}

	// TODO: use some sort of global config for this path.
	credentialSession, err := ibmcloud.AuthenticateFromFile(home + "/.cacli/credentials.json")
	if err != nil {
		s.Stop()
		fmt.Println(text.Colors{text.FgRed, text.Bold}.Sprintf("FAILED"))
		fmt.Println("Not logged in. Use '" + text.Colors{text.FgCyan, text.Bold}.Sprintf("cacli login") + "' to log in.")
		os.Exit(1)
	}

	return credentialSession
}
