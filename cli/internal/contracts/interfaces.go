package contracts

// ArchAsset represents a downloadable WSL distribution archive for a specific CPU architecture.
type ArchAsset struct {
	Url    string `json:"Url"`
	Sha256 string `json:"Sha256"`
}

// ModernDistroVersion represents a single release entry inside ModernDistributions.
type ModernDistroVersion struct {
	Name         string     `json:"Name"`
	FriendlyName string     `json:"FriendlyName"`
	Default      bool       `json:"Default"`
	Amd64Url     *ArchAsset `json:"Amd64Url,omitempty"`
	Arm64Url     *ArchAsset `json:"Arm64Url,omitempty"`
}

// DistributionManifest models the Microsoft WSL 2.4.4+ ModernDistributions JSON schema.
type DistributionManifest struct {
	ModernDistributions map[string][]ModernDistroVersion `json:"ModernDistributions"`
}

// InstalledDistro represents a WSL distribution currently registered on the Windows host.
type InstalledDistro struct {
	Name      string
	State     string
	Version   string
	IsDefault bool
}

// GitConfigReader segregates read-only Git inspections (used by 'tl verify').
type GitConfigReader interface {
	GetVersion() (major, minor, patch int, raw string, err error)
	GetConfig(key string) (string, error)
}

// GitConfigMutator segregates write operations (used by 'tl onboard').
type GitConfigMutator interface {
	GitConfigReader
	SetGlobalConfig(key, value string) error
}

// WSLDistroInspector segregates read-only WSL2 inspections (used by 'tl distro status|list').
type WSLDistroInspector interface {
	ListInstalledDistros() ([]InstalledDistro, error)
	FetchCatalogManifest(source string) (*DistributionManifest, error)
	VerifyFileSHA256(filePath, expectedHexHash string) (bool, error)
}

// WSLDistroOperator extends inspection with installation actions (used by 'tl distro install').
type WSLDistroOperator interface {
	WSLDistroInspector
	InstallFromCatalog(distroName string) error
	InstallFromFile(wslFilePath, distroName string) error
}
