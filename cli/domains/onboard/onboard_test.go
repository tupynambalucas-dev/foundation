package onboard

import (
	"testing"

	"github.com/tupynambalucas-dev/workstation/cli/internal/config"
)

func TestNewOnboardCmdFlags(t *testing.T) {
	cmd := NewOnboardCmd()
	if cmd.Use != "onboard" {
		t.Errorf("expected command Use='onboard', got %q", cmd.Use)
	}

	emailFlag := cmd.Flags().Lookup("email")
	if emailFlag == nil || emailFlag.DefValue != config.DefaultEmail {
		t.Errorf("expected default email %q, got %v", config.DefaultEmail, emailFlag)
	}

	orgFlag := cmd.Flags().Lookup("org")
	if orgFlag == nil || orgFlag.DefValue != config.DefaultOrg {
		t.Errorf("expected default org %q, got %v", config.DefaultOrg, orgFlag)
	}
}

func TestNewVerifyCmd(t *testing.T) {
	cmd := NewVerifyCmd()
	if cmd.Use != "verify" {
		t.Errorf("expected command Use='verify', got %q", cmd.Use)
	}
}
