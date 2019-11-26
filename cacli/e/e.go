package e

import (
	"fmt"
	"os"

	"github.com/jedib0t/go-pretty/text"
)

func Exit(err error) {
	fmt.Println(text.Colors{text.FgRed}.Sprintf("error") + " " + err.Error())
	os.Exit(1)
}
