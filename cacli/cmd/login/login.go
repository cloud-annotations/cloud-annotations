package login

import (
	"fmt"
	"os"
	"os/exec"
	"runtime"

	"github.com/cloud-annotations/survey/terminal"
	"github.com/cloud-annotations/training/cacli/talkdirtytome"
	"github.com/davecgh/go-spew/spew"

	"github.com/cloud-annotations/training/cacli/ibmcloud"
	"github.com/jedib0t/go-pretty/text"

	"github.com/spf13/cobra"
)

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

func Run(*cobra.Command, []string) {

	identityEndpoints := ibmcloud.GetIdentityEndpoints()

	fmt.Printf("receive a One-Time Passcode from %s to proceed.\n", text.Colors{text.Bold, text.FgCyan}.Sprintf(identityEndpoints.PasscodeEndpoint))

	shouldOpenInBrowser := false
	if err := talkdirtytome.YesOrNah("open the URL in the default browser?", &shouldOpenInBrowser); err != nil {
		return
	}

	if shouldOpenInBrowser {
		openbrowser(identityEndpoints.PasscodeEndpoint)
	}

	otp := ""
	if err := talkdirtytome.IWantStringCheese("One-Time Passcode", &otp); err != nil {
		return
	}

	fmt.Println()

	session := ibmcloud.Authenticate(otp)
	accounts := session.GetAccounts()

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

	accountIndex := 0
	if err := talkdirtytome.ImportantList("Account", accountNames, &accountIndex); err != nil {
		return
	}

	fmt.Println()

	accountSession := session.BindAccountToToken(accounts.Resources[accountIndex])

	objectStorage := accountSession.GetObjectStorageResources()
	machineLearning := accountSession.GetMachineLearningResources()

	var objectStorageNames []string
	var machineLearningNames []string

	for _, element := range objectStorage.Resources {
		objectStorageNames = append(objectStorageNames, element.Name)
	}
	for _, element := range machineLearning.Resources {
		machineLearningNames = append(machineLearningNames, element.Name)
	}

	objectStorageIndex := 0
	if err := talkdirtytome.ImportantList("Object Storage Instance", objectStorageNames, &objectStorageIndex); err != nil {
		return
	}

	cursor := &terminal.Cursor{
		In:  os.Stdin,
		Out: os.Stdout,
	}
	cursor.HorizontalAbsolute(0)
	terminal.EraseLine(cursor.Out, terminal.ERASE_LINE_ALL)
	cursor.PreviousLine(1)
	terminal.EraseLine(cursor.Out, terminal.ERASE_LINE_ALL)
	cursor.PreviousLine(1)
	terminal.EraseLine(cursor.Out, terminal.ERASE_LINE_ALL)
	fmt.Println("Object Storage Instance " + text.Colors{text.Bold, text.FgCyan}.Sprintf(objectStorageNames[objectStorageIndex]))

	fmt.Println()

	machineLearningIndex := 0
	if err := talkdirtytome.ImportantList("Machine Learning Instance", machineLearningNames, &machineLearningIndex); err != nil {
		return
	}

	cursor.HorizontalAbsolute(0)
	terminal.EraseLine(cursor.Out, terminal.ERASE_LINE_ALL)
	cursor.PreviousLine(1)
	terminal.EraseLine(cursor.Out, terminal.ERASE_LINE_ALL)
	cursor.PreviousLine(1)
	terminal.EraseLine(cursor.Out, terminal.ERASE_LINE_ALL)
	fmt.Println("Machine Learning Instance " + text.Colors{text.Bold, text.FgCyan}.Sprintf(machineLearningNames[machineLearningIndex]))

	// TODO: can we bind the credential methods to the resource objects?
	// we would need a way to keep the account session. i.e. we need to bind the
	// session to all resources returned...
	// maybe we shouldn't force this because it's not a restriction on the service.
	creds := accountSession.GetCredentials(ibmcloud.GetCredentialsParams{
		Name: "cloud-annotations-binding",
		Crn:  objectStorage.Resources[objectStorageIndex].Crn,
	})

	spew.Dump(creds)

	createdCred := accountSession.CreateCredential(ibmcloud.CreateCredentialParams{
		Name:   "cloud-annotations-binding",
		Source: objectStorage.Resources[objectStorageIndex].GUID,
		Role:   "writer",
		Parameters: ibmcloud.HMACParameters{
			HMAC: true,
		},
	})

	spew.Dump(createdCred)

	//TODO: add spinners.
}

// TODO: ibmcloud not logged in example.
// $RED(FAILED)
// Not logged in. Use '$YELLOW(ibmcloud login)' to log in.

////////////////////////////////////////////////////////////////////////////////
// TODO: theoretical login examples:
////////////////////////////////////////////////////////////////////////////////

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
