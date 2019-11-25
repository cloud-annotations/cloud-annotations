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
	creds := accountSession.GetCredentials(ibmcloud.CredentialParams{
		Name: "cloud-annotations-binding",
		Crn:  objectStorage.Resources[objectStorageIndex].Crn,
	})

	spew.Dump(creds)

	createdCred := accountSession.CreateCredential(objectStorage.Resources[objectStorageIndex].GUID)

	spew.Dump(createdCred)
}
