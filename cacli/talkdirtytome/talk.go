package talkdirtytome

import (
	"fmt"

	"github.com/cloud-annotations/survey"
	"github.com/jedib0t/go-pretty/text"
)

func ImportantList(message string, ops []string, res interface{}) error {
	if len(ops) == 1 {
		fmt.Println(message + " " + text.Colors{text.Bold, text.FgCyan}.Sprintf(ops[0]))
		res = 0
		return nil
	}

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

	prompt := &survey.Select{
		Message:  message,
		Options:  ops,
		PageSize: 11,
	}

	return survey.AskOne(prompt, res)
}

func IWantStringCheese(message string, res interface{}) error {
	survey.InputQuestionTemplate = `
{{- color "default"}}{{ .Message }} {{color "reset"}}{{- color "cyan+b"}}❯ {{color "reset"}}
{{- if .Answer}}
  {{- color "default"}}{{ .Answer }}{{color "reset"}}{{"\n"}}
{{- end}}`
	prompt := &survey.Input{
		Message: message,
	}
	return survey.AskOne(prompt, res)
}

func YesOrNah(message string, res interface{}) error {
	survey.ConfirmQuestionTemplate = `
{{- color "default"}}{{ .Message }} {{color "reset"}}
{{- if .Answer}}
  {{- color "default"}}{{- if eq .Answer "Yes"}}yes{{- else }}no{{- end}}{{color "reset"}}{{"\n"}}
{{- else }}
  {{- color "default"}}{{if .Default}}(yes) {{else}}(no) {{end}}{{color "reset"}}
{{- end}}`
	prompt := &survey.Confirm{
		Message: message,
		Default: true,
	}
	return survey.AskOne(prompt, res)
}
