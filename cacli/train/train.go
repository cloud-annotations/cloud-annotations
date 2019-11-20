package train

import (
	"fmt"
	"strings"
	"time"

	"github.com/briandowns/spinner"
	"github.com/cloud-annotations/survey"
	"github.com/jedib0t/go-pretty/text"
	"github.com/spf13/cobra"
)

func Run(cmd *cobra.Command, args []string) {
	s := spinner.New(spinner.CharSets[14], 60*time.Millisecond)
	s.Suffix = " Checking login..."
	s.Start()
	time.Sleep(500 * time.Millisecond)
	s.Stop()

	s.Suffix = " Loading buckets..."
	s.Start()
	time.Sleep(500 * time.Millisecond)
	s.Stop()

	color := ""
	survey.SelectQuestionTemplate = `
{{- if .ShowAnswer}}
	{{- color "default"}}{{ .Message }}{{color "reset"}}{{color "cyan+b"}} {{.Answer}}{{color "reset"}}{{"\n"}}
{{- else}}
	{{- color "default+b"}}{{ .Message }}s{{color "reset"}}{{- color "default"}}{{ .FilterMessage }}{{color "reset"}}
  {{- color "default+d"}} (Use arrow keys and enter to choose){{color "reset"}}
  {{- "\n"}}
  {{- range $ix, $choice := .PageEntries}}
    {{- if eq $ix $.SelectedIndex }}{{color "cyan+b" }}❯ {{else}}{{color "default"}}  {{end}}
    {{- $choice.Value}}
    {{- color "reset"}}{{"\n"}}
  {{- end}}
{{- end}}`

	prompt3 := &survey.Select{
		Message:  "Bucket",
		Options:  []string{"red", "blue", "green", "red", "blue", "green", "red", "blue", "green", "red", "blue", "green", "red", "blue", "green"},
		PageSize: 11,
	}

	err := survey.AskOne(prompt3, &color)
	if err != nil {
		return
	}

	fmt.Println()

	s.Suffix = " Checking bucket..."
	s.Start()
	time.Sleep(500 * time.Millisecond)
	s.Stop()

	s.Suffix = " Starting training run..."
	s.Start()
	time.Sleep(500 * time.Millisecond)
	s.Stop()

	fmt.Println(text.FgGreen.Sprintf("success"), "Training run submitted.")
	fmt.Println()

	modelID := "model-iaa0w3y9"
	border := strings.Repeat("─", len(modelID))
	fmt.Println("Model ID:")
	fmt.Printf("┌─%s─┐\n", border)
	fmt.Printf("│ %s │\n", text.Colors{text.FgCyan, text.Bold}.Sprintf(modelID))
	fmt.Printf("└─%s─┘\n", border)
	fmt.Println()

	name := false
	survey.ConfirmQuestionTemplate = `
{{- if .ShowHelp }}{{- color .Config.Icons.Help.Format }}{{ .Config.Icons.Help.Text }} {{ .Help }}{{color "reset"}}{{"\n"}}{{end}}
{{- color "default"}}{{ .Message }} {{color "reset"}}
{{- if .Answer}}
  {{- color "cyan+b"}}{{.Answer}}{{color "reset"}}{{"\n"}}
{{- else }}
  {{- if and .Help (not .ShowHelp)}}{{color "cyan"}}[{{ .Config.HelpInput }} for help]{{color "reset"}} {{end}}
  {{- color "default"}}{{if .Default}}(yes) {{else}}(no) {{end}}{{color "reset"}}
{{- end}}`
	prompt2 := &survey.Confirm{
		Message: "Would you like to monitor progress?",
		Default: true,
	}
	survey.AskOne(prompt2, &name)

	// const shouldMonitor = stringToBool(
	//   await input(`Would you like to monitor progress? `, 'yes')
	// )

	// if (shouldMonitor) {
	//   console.log()
	//   await progress([modelId], finalizedConfig)
	// }
}
