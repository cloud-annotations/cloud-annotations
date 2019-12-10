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

func AssertLoggedIn() *ibmcloud.AccountSession {
	s := spinner.New(spinner.CharSets[14], 60*time.Millisecond)
	s.Suffix = " Checking login..."
	s.Start()
	defer s.Stop()

	/*
		go build && \
		CACLI_WML_INSTANCE_ID=wmlInstanceID \
		CACLI_WML_API_KEY=wmlAPIKey \
		CACLI_WML_URL="https://us-south.ml.cloud.ibm.com" \
		CACLI_COS_ACCESS_KEY=cosAccessKey \
		CACLI_COS_SECRET_KEY=cosSecretKey \
		./cacli list
	*/
	wmlInstanceID := viper.Get("wml_instance_id")
	wmlAPIKey := viper.Get("wml_api_key")
	wmlURL := viper.Get("wml_url")
	cosAccessKey := viper.Get("cos_access_key")
	cosSecretKey := viper.Get("cos_secret_key")
	if isSet(wmlInstanceID) && isSet(wmlAPIKey) && isSet(wmlURL) && isSet(cosAccessKey) && isSet(cosSecretKey) {
		// TODO: We don't need to auth we just need to fill some caches.
		fmt.Println(wmlInstanceID)
		fmt.Println(wmlAPIKey)
		fmt.Println(wmlURL)
		fmt.Println(cosAccessKey)
		fmt.Println(cosSecretKey)
	}

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
