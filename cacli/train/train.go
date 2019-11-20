package train

import (
	"fmt"
	"strings"
	"time"

	"github.com/briandowns/spinner"
	"github.com/cloud-annotations/promptui"
	"github.com/cloud-annotations/survey"
	"github.com/jedib0t/go-pretty/text"
	"github.com/spf13/cobra"
)

type pepper struct {
	Name     string
	HeatUnit int
	Peppers  int
}

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

	peppers := []pepper{
		{Name: "Bell Pepper", HeatUnit: 0, Peppers: 0},
		{Name: "Banana Pepper", HeatUnit: 100, Peppers: 1},
		{Name: "Poblano", HeatUnit: 1000, Peppers: 2},
		{Name: "Jalapeño", HeatUnit: 3500, Peppers: 3},
		{Name: "Aleppo", HeatUnit: 10000, Peppers: 4},
		{Name: "Tabasco", HeatUnit: 30000, Peppers: 5},
		{Name: "Malagueta", HeatUnit: 50000, Peppers: 6},
	}

	templates := &promptui.SelectTemplates{
		Label:    "{{ . | bold }}s {{\"(Use arrow keys and enter to choose)\" | faint }}",
		Active:   "{{\"❯\" | cyan | bold }} {{ .Name | cyan | bold }}",
		Inactive: "  {{ .Name }}",
		Selected: "{{ .Label }} {{ .Item.Name | cyan | bold }}",
	}

	prompt := promptui.Select{
		Label:     "Bucket",
		Items:     peppers,
		Templates: templates,
		Size:      11,
		HideHelp:  true,
	}

	if _, _, err := prompt.Run(); err != nil {
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
	prompt2 := &survey.Confirm{
		Message: "Do you like pie?",
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
