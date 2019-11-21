package progress

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/briandowns/spinner"
	"github.com/cheggaaa/pb"
	"github.com/spf13/cobra"
)

func Run(_ *cobra.Command, args []string) {
	if len(args) != 1 {
		panic("aahhhh")
	}

	s := spinner.New(spinner.CharSets[14], 60*time.Millisecond)
	s.Suffix = " Preparing to train (this may take a while)..."
	s.Start()
	time.Sleep(500 * time.Millisecond)
	s.Stop()

	fmt.Print("\033[?25l")
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		fmt.Print("\033[?25h")
		os.Exit(1)
	}()

	template := `{{ bar . "[" "#" "-" "-" "]"}} {{counters . "%s/%s"}} {{rtime . "| ETA: %s"}}`
	count := 10000
	bar := pb.New(count)
	bar.SetTemplateString(template)
	bar.Start()

	for i := 0; i < count; i++ {
		bar.Increment()
		time.Sleep(time.Millisecond)
	}

	bar.Finish()
	fmt.Print("\033[?25h")
}
