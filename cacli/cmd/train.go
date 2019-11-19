/*
Copyright © 2019 Nick Bourdakos <bourdakos1@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
package cmd

import (
	"github.com/cloud-annotations/promptui"
	"github.com/spf13/cobra"
)

type pepper struct {
	Name     string
	HeatUnit int
	Peppers  int
}

// trainCmd represents the train command
var trainCmd = &cobra.Command{
	Use:   "train",
	Short: "A brief description of your command",
	Long: `A longer description that spans multiple lines and likely contains examples
and usage of using your command. For example:

Cobra is a CLI library for Go that empowers applications.
This application is a tool to generate the needed files
to quickly create a Cobra application.`,
	Run: func(cmd *cobra.Command, args []string) {
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
			Label:     "Pepper",
			Items:     peppers,
			Templates: templates,
			Size:      11,
			HideHelp:  true,
		}

		if _, _, err := prompt.Run(); err != nil {
			return
		}
	},
}

func init() {
	rootCmd.AddCommand(trainCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// trainCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// trainCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
