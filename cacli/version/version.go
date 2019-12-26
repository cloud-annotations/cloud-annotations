package version

var Version string

func BuildVersion() string {
	if len(Version) == 0 {
		return "dev"
	}
	return Version
}
