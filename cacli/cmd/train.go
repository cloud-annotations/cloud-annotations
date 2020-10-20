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
	"github.com/cloud-annotations/training/cacli/cmd/train"
	"github.com/spf13/cobra"
)

// trainCmd represents the train command
var trainCmd = &cobra.Command{
	Use:   "train [<bucket>]",
	Short: "Start a training run",
	Long: `Start a training run for the given bucket. This command will interactively ask
for required information unless otherwise specified.

Basic Example:
  cacli train

Noninteractive Example:
  cacli train BUCKET \
    --cos-access-key ACCESS-KEY \
    --cos-secret-key SECRET-KEY \
    --wml-instance-id INSTANCE-ID \
    --wml-api-key API-KEY \
    --wml-url URL
`,
	Run: train.Run,
}

func init() {
	rootCmd.AddCommand(trainCmd)

	trainCmd.Flags().String("name", "", "Optional project name")
	trainCmd.Flags().String("output", "", "Optional output bucket")
	trainCmd.Flags().Int("steps", 1000, "Number of training steps")
	trainCmd.Flags().String("gpu", "k80", "k80x2, k80x4, v100, v100x2")
	trainCmd.Flags().String("script", "", "Custom training script.zip")

	trainCmd.Flags().String("framework", "tensorflow", "keras, pytorch, caffe")
	trainCmd.Flags().String("frameworkv", "1.15", "Framework version")
	trainCmd.Flags().String("pythonv", "3.6", "Python version")
}
