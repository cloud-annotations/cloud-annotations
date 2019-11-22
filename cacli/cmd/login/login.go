package login

import (
	"fmt"
	"log"
	"os/exec"
	"runtime"

	"github.com/cloud-annotations/survey"
	"github.com/cloud-annotations/training/cacli/ibmcloud"

	"github.com/spf13/cobra"
)

func openbrowser(url string) {
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
	if err != nil {
		log.Fatal(err)
	}

}

func Run(*cobra.Command, []string) {
	identityEndpoints := ibmcloud.GetIdentityEndpoints()

	fmt.Printf("receive a One-Time Passcode from %s to proceed.\n", identityEndpoints.PasscodeEndpoint)

	shouldOpenInBrowser := false
	survey.ConfirmQuestionTemplate = `
{{- if .ShowHelp }}{{- color .Config.Icons.Help.Format }}{{ .Config.Icons.Help.Text }} {{ .Help }}{{color "reset"}}{{"\n"}}{{end}}
{{- color "default"}}{{ .Message }} {{color "reset"}}
{{- if .Answer}}
  {{- color "cyan+b"}}{{.Answer}}{{color "reset"}}{{"\n"}}
{{- else }}
  {{- if and .Help (not .ShowHelp)}}{{color "cyan"}}[{{ .Config.HelpInput }} for help]{{color "reset"}} {{end}}
  {{- color "default"}}{{if .Default}}(yes) {{else}}(no) {{end}}{{color "reset"}}
{{- end}}`
	prompt1 := &survey.Confirm{
		Message: "open the URL in the default browser?",
		Default: true,
	}
	survey.AskOne(prompt1, &shouldOpenInBrowser)

	if shouldOpenInBrowser {
		openbrowser(identityEndpoints.PasscodeEndpoint)
	}

	otp := ""
	survey.InputQuestionTemplate = `
{{- if .ShowHelp }}{{- color .Config.Icons.Help.Format }}{{ .Config.Icons.Help.Text }} {{ .Help }}{{color "reset"}}{{"\n"}}{{end}}
{{- color "default"}}{{ .Message }} {{color "reset"}}
{{- if .Answer}}
  {{- color "cyan+b"}}{{.Answer}}{{color "reset"}}{{"\n"}}
{{- else }}
  {{- if and .Help (not .ShowHelp)}}{{color "cyan"}}[{{ .Config.HelpInput }} for help]{{color "reset"}} {{end}}
  {{- color "default"}}{{if .Default}}(yes) {{else}}(no) {{end}}{{color "reset"}}
{{- end}}`
	prompt2 := &survey.Input{
		Message: "Would you like to monitor progress?",
	}
	survey.AskOne(prompt2, &otp)

	fmt.Println(otp)

	//0EANCXlwL6
}
