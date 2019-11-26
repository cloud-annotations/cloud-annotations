package logout

import (
	"fmt"
	"os"

	"github.com/jedib0t/go-pretty/text"
	"github.com/mitchellh/go-homedir"
	"github.com/spf13/cobra"
)

func Run(*cobra.Command, []string) {
	fmt.Println("Logging out...")

	home, err := homedir.Dir()
	if err != nil {
		fmt.Println(text.Colors{text.FgRed}.Sprintf("error") + " " + err.Error())
		os.Exit(1)
	}

	// TODO: use some sort of global config for this path.
	if err := os.Remove(home + "/.cacli/credentials.json"); err != nil {
		e, _ := err.(*os.PathError)
		if e.Err.Error() != "no such file or directory" {
			fmt.Println(text.Colors{text.FgRed}.Sprintf("error") + " " + err.Error())
			os.Exit(1)
		}
	}

	fmt.Println(text.Colors{text.FgGreen}.Sprintf("success"))
}
