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
	"fmt"
	"os"

	"github.com/cloud-annotations/training/cacli/version"
	"github.com/spf13/cobra"

	homedir "github.com/mitchellh/go-homedir"
	"github.com/spf13/viper"
)

var cfgFile string

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "cacli",
	Short: "A command line tool for training machine learning models",
	Long: fmt.Sprintf(`  ___        _               ___ _    ___  
 / __|      /_\             / __| |  |_ _| 
| (__      / _ \           | (__| |__ | |  
 \___loud /_/ \_nnotations  \___|____|___| (v%s)

A command line tool for training/managing Watson Machine Learning models based
on datasets created with Cloud Annotations. 

For more info visit: https://cloud.annotations.ai 

To get started, login then train:
  cacli login && cacli train`, version.BuildVersion()),
	Version: version.BuildVersion(),
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

func init() {
	cobra.OnInitialize(initConfig)
	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.cacli.yaml)")
	rootCmd.PersistentFlags().String("wml-api-key", "", "Watson Machine Learning api key")
	rootCmd.PersistentFlags().String("wml-instance-id", "", "Watson Machine Learning instance id")
	rootCmd.PersistentFlags().String("wml-url", "", "Watson Machine Learning url")
	rootCmd.PersistentFlags().String("cos-access-key", "", "Cloud Object Storage access key id")
	rootCmd.PersistentFlags().String("cos-secret-key", "", "Cloud Object Storage secret access key")
	viper.BindPFlag("wml_api_key", rootCmd.PersistentFlags().Lookup("wml-api-key"))
	viper.BindPFlag("wml_instance_id", rootCmd.PersistentFlags().Lookup("wml-instance-id"))
	viper.BindPFlag("wml_url", rootCmd.PersistentFlags().Lookup("wml-url"))
	viper.BindPFlag("cos_access_key", rootCmd.PersistentFlags().Lookup("cos-access-key"))
	viper.BindPFlag("cos_secret_key", rootCmd.PersistentFlags().Lookup("cos-secret-key"))
}

// initConfig reads in config file and ENV variables if set.
func initConfig() {
	if cfgFile != "" {
		// Use config file from the flag.
		viper.SetConfigFile(cfgFile)
	} else {
		// Find home directory.
		home, err := homedir.Dir()
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}

		// Search config in home directory with name ".cacli" (without extension).
		viper.AddConfigPath(home)
		viper.SetConfigName(".cacli")
	}

	viper.SetEnvPrefix("cacli")
	viper.AutomaticEnv() // read in environment variables that match

	// If a config file is found, read it in.
	if err := viper.ReadInConfig(); err == nil {
		fmt.Println("Using config file:", viper.ConfigFileUsed())
	}
}
