package main

import (
	"os"

	"github.com/tupynambalucas-dev/foundation/extensions/gh-tl/cmd"
)

func main() {
	if err := cmd.Execute(); err != nil {
		os.Exit(1)
	}
}
