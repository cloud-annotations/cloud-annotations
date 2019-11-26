package logout

import (
	"fmt"
	"os"

	"github.com/cloud-annotations/training/cacli/e"
	"github.com/jedib0t/go-pretty/text"
	"github.com/mitchellh/go-homedir"
	"github.com/spf13/cobra"
)

func Run(*cobra.Command, []string) {
	fmt.Println("Logging out...")

	home, err := homedir.Dir()
	if err != nil {
		e.Exit(err)
	}

	// TODO: use some sort of global config for this path.
	if err := os.Remove(home + "/.cacli/credentials.json"); err != nil {
		err, _ := err.(*os.PathError)
		if err.Err.Error() != "no such file or directory" {
			e.Exit(err)
		}
	}

	fmt.Println(text.Colors{text.FgGreen}.Sprintf("success"))
}
