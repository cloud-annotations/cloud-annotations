package login

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"runtime"
	"time"

	homedir "github.com/mitchellh/go-homedir"

	"github.com/briandowns/spinner"
	"github.com/cloud-annotations/survey/terminal"
	"github.com/cloud-annotations/training/cacli/e"
	"github.com/cloud-annotations/training/cacli/talkdirtytome"

	"github.com/cloud-annotations/training/cacli/ibmcloud"
	"github.com/jedib0t/go-pretty/text"

	"github.com/spf13/cobra"
)

var s = spinner.New(spinner.CharSets[14], 60*time.Millisecond)
var c = &terminal.Cursor{In: os.Stdin, Out: os.Stdout}

func openbrowser(url string) error {
	var err error
	switch runtime.GOOS {
	case "linux":
		err = exec.Command("xdg-open", url).Start()
	case "windows":
		err = exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	case "darwin":
		err = exec.Command("open", url).Start()
	default:
		err = fmt.Errorf("unsupported platform")
	}
	return err
}

func clearLines(num int) {
	c.HorizontalAbsolute(0)
	terminal.EraseLine(c.Out, terminal.ERASE_LINE_ALL)
	for i := 0; i < num-1; i++ {
		c.PreviousLine(1)
		terminal.EraseLine(c.Out, terminal.ERASE_LINE_ALL)
	}
}

func Run(*cobra.Command, []string) {
	// Get the login endpoint and ask to open the browser.
	identityEndpoints, err := ibmcloud.GetIdentityEndpoints()
	if err != nil {
		e.Exit(err)
	}
	fmt.Printf("receive a One-Time Passcode from %s to proceed.\n", text.Colors{text.Bold, text.FgCyan}.Sprintf(identityEndpoints.PasscodeEndpoint))

	shouldOpenInBrowser := false
	if err := talkdirtytome.YesOrNah("open the URL in the default browser?", &shouldOpenInBrowser); err != nil {
		if err.Error() == "interrupt" {
			os.Exit(1)
		} else {
			e.Exit(err)
		}
	}

	if shouldOpenInBrowser {
		openbrowser(identityEndpoints.PasscodeEndpoint)
	}

	// Ask for the one-time passcode.
	otp := ""
	if err := talkdirtytome.IWantStringCheese("One-Time Passcode", &otp); err != nil {
		if err.Error() == "interrupt" {
			os.Exit(1)
		} else {
			e.Exit(err)
		}
	}
	fmt.Println()

	// Waiting...
	s.Suffix = " Authenticating..."
	s.Start()

	// Authenticate the passcode and get a list of accounts.
	session, err := ibmcloud.Authenticate(otp)
	if err != nil {
		e.Exit(err)
	}
	accounts, err := session.GetAccounts()
	if err != nil {
		e.Exit(err)
	}

	// Loop through all the accounts and create a list of names in the form of:
	// ACCOUNT_NAME (ACCOUNT_ID) <-> (SOFTLAYER_ID)
	var accountNames []string
	for _, account := range accounts.Resources {
		accountID := account.Metadata.GUID
		name := account.Entity.Name + " (" + accountID + ")"
		bluemixSubscriptions := account.Entity.BluemixSubscriptions
		if len(bluemixSubscriptions) > 0 && bluemixSubscriptions[0].SoftlayerAccountID != "" {
			name += " <-> " + bluemixSubscriptions[0].SoftlayerAccountID
		}
		accountNames = append(accountNames, name)
	}

	s.Stop()

	// Ask for an account.
	accountIndex := 0
	if err := talkdirtytome.ImportantList("Account", accountNames, &accountIndex); err != nil {
		if err.Error() == "interrupt" {
			os.Exit(1)
		} else {
			e.Exit(err)
		}
	}
	fmt.Println()

	// Waiting...
	s.Suffix = " Loading resources..."
	s.Start()

	// Bind the chosen account to the session.
	accountSession, err := session.BindAccountToToken(accounts.Resources[accountIndex])

	// Get lists of resources.
	objectStorage, err := accountSession.GetObjectStorageResources()
	if err != nil {
		e.Exit(err)
	}
	machineLearning, err := accountSession.GetMachineLearningResources()
	if err != nil {
		e.Exit(err)
	}

	// Generate resource names.
	var objectStorageNames []string
	for _, element := range objectStorage.Resources {
		objectStorageNames = append(objectStorageNames, element.Name)
	}

	var machineLearningNames []string
	for _, element := range machineLearning.Resources {
		machineLearningNames = append(machineLearningNames, element.Name)
	}

	s.Stop()

	// Ask for an object storage instace.
	objectStorageIndex := 0
	if err := talkdirtytome.ImportantList("Object Storage Instance", objectStorageNames, &objectStorageIndex); err != nil {
		if err.Error() == "interrupt" {
			os.Exit(1)
		} else {
			e.Exit(err)
		}
	}

	// Delete a few lines to be flush with the last question.
	clearLines(3)
	fmt.Println("Object Storage Instance " + text.Colors{text.Bold, text.FgCyan}.Sprintf(objectStorageNames[objectStorageIndex]))
	fmt.Println()

	// Ask for a watson machine learning instace.
	machineLearningIndex := 0
	if err := talkdirtytome.ImportantList("Machine Learning Instance", machineLearningNames, &machineLearningIndex); err != nil {
		if err.Error() == "interrupt" {
			os.Exit(1)
		} else {
			e.Exit(err)
		}
	}

	// Delete a few lines to be flush with the last question.
	clearLines(3)
	fmt.Println("Machine Learning Instance " + text.Colors{text.Bold, text.FgCyan}.Sprintf(machineLearningNames[machineLearningIndex]))
	fmt.Println()

	// Waiting...
	s.Suffix = " Verifying..."
	s.Start()

	// Try to find a binding to object storage.
	creds, err := accountSession.GetCredentials(ibmcloud.GetCredentialsParams{
		Name: "cloud-annotations-binding",
		Crn:  objectStorage.Resources[objectStorageIndex].Crn,
	})
	if err != nil {
		e.Exit(err)
	}

	// If there isn't one, create one.
	if len(creds.Resources) == 0 {
		_, err := accountSession.CreateCredential(ibmcloud.CreateCredentialParams{
			Name:   "cloud-annotations-binding",
			Source: objectStorage.Resources[objectStorageIndex].GUID,
			Role:   "writer",
			Parameters: ibmcloud.HMACParameters{
				HMAC: true,
			},
		})
		if err != nil {
			e.Exit(err)
		}
	}

	s.Stop()

	// TODO: clean this.
	// Get the users home directory.
	home, err := homedir.Dir()
	if err != nil {
		e.Exit(err)
	}

	// Persist Token.
	tokenFile, err := json.MarshalIndent(accountSession.Token, "", "\t") // is it worth pretty printing?
	if err != nil {
		e.Exit(err)
	}
	err = ioutil.WriteFile(home+"/.cacli/credentials.json", tokenFile, 0644)
	if err != nil {
		e.Exit(err)
	}

	// Persist object storage info.
	cosFile, err := json.MarshalIndent(objectStorage.Resources[objectStorageIndex], "", "\t")
	if err != nil {
		e.Exit(err)
	}
	err = ioutil.WriteFile(home+"/.cacli/cos.json", cosFile, 0644)
	if err != nil {
		e.Exit(err)
	}

	// Persist machine learning info.
	wmlFile, err := json.MarshalIndent(machineLearning.Resources[machineLearningIndex], "", "\t")
	if err != nil {
		e.Exit(err)
	}
	err = ioutil.WriteFile(home+"/.cacli/wml.json", wmlFile, 0644)
	if err != nil {
		e.Exit(err)
	}

	fmt.Println(text.Colors{text.FgGreen}.Sprintf("success") + " You are now logged in.")
}

// QUESTION: Do we want to make users re-choose resources when session expires?
// - if yes we should at least have the item scrolled to as a sort of "default"

////////////////////////////////////////////////////////////////////////////////
// TODO: theoretical login examples:
////////////////////////////////////////////////////////////////////////////////
// SCRATCH EVERYTHING...
// we should just use legacy credentials for loging in with no interaction.
// ie the credentials.json from the ibmcloud GUI.
// ```
// cacli login --wml @wml.json --cos @cos.json --non-interactive
// ```

// NOTE: the account id is tied to the resource responce json.
// QUESTION: do we need the user to provide an account id?
// - YES, we need the account id to get the WML region and generate credentials
// - I meannnnnn technically we could brute force all the listed accounts to find
//   the right one.
// - We should also test if we can list resources via a ibmcloud apikey. it might
//   already have account context.

// QUESTION: Should we even make them choose a COS instance at login?

// interaction required:
// ```
// cacli login
// ```

// zero interaction: (general case flags)
// ```
// cacli login \
//   --apikey GLOBAL_IBM_API_KEY \
//   --wmlinstanceid YOUR_WML_INSTANCE_ID \ /* I think we can use the instance to find the proper region */
//   --cosinstanceid YOUR_COS_INSTANCE_ID \
//   --account ACCOUNT_TO_TARGET
// ```

// Maybe we want the option to log in, with no account targeted?
// ```
// export IBMCLOUD_API_KEY=GLOBAL_IBM_API_KEY
// cacli login --no-interaction
// cacli train \
//   --wmlinstanceid YOUR_WML_INSTANCE_ID \
//   --cosinstanceid YOUR_COS_INSTANCE_ID \
//   --account ACCOUNT_TO_TARGET \
//   --bucket MY_BUCKET \
//   --steps 1000 \
//   --gpu k80 \
//   --output MY_OTHER_BUCKET
// ```

// Maybe we want the option to log in, with no account targeted?
// ```
// export IBMCLOUD_API_KEY=GLOBAL_IBM_API_KEY
// cacli login --no-interaction /* do we even need to run login? */
// cacli train \
//   --account ACCOUNT_TO_TARGET \
//   --wmlinstanceid YOUR_WML_INSTANCE_ID \
//   --cosinstanceid YOUR_COS_INSTANCE_ID \
//   --bucket MY_BUCKET \
//   --steps 1000 \
//   --gpu k80 \
//   --output MY_OTHER_BUCKET
// ```

// Allow HMAC to allow for targeting random stuff
// ```
// export IBMCLOUD_API_KEY=GLOBAL_IBM_API_KEY
// cacli train \
//   --account ACCOUNT_TO_TARGET \
//   --wmlinstanceid YOUR_WML_INSTANCE_ID \
//   --cosinstanceid YOUR_COS_INSTANCE_ID \ /* this will be overridden if any bucket creds are specified */
//   --bucket MY_BUCKET \
//   --bucketcreds MY_ID:MY_key \
//   --steps 1000 \
//   --gpu k80 \
//   --output MY_OTHER_BUCKET \
//   --outputcreds MY_ID:MY_key
// ```

////////////////////////////////////////////////////////////////////////////////
// TODO: easily switch instances without re-login
////////////////////////////////////////////////////////////////////////////////
// This could get funky because you might need to change account to use the
// resource you want.
// might be best to just have a `cacli target` interactive command.
// ```
// cacli target \
//   --account YOUR_ACCOUNT_ID \
//   --wml YOUR_WML_INSTANCE_ID \
//   --cos YOUR_COS_INSTANCE_ID
// ```
