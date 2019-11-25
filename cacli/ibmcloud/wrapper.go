package ibmcloud

var endpoints IdentityEndpoints
var endpointSet = false // idk how to null/undefined check...

func cacheIdentityEndpoints() {
	if !endpointSet {
		endpoints = getIdentityEndpoints()
		endpointSet = true
	}
}

func GetIdentityEndpoints() IdentityEndpoints {
	cacheIdentityEndpoints()
	return endpoints
}

type Session struct {
	Token Token
}

func Authenticate(otp string) Session {
	cacheIdentityEndpoints()
	token := getToken(endpoints.TokenEndpoint, otp)
	return Session{Token: token}
}

func (s *Session) GetAccounts() Accounts {
	accounts := getAccounts(s.Token.AccessToken)
	if accounts.NextURL != nil {
		// TODO: get the rest of the accounts.
		panic("boom")
	}
	return accounts
}

type AccountSession struct {
	Token Token
}

func (s *Session) BindAccountToToken(account Account) AccountSession {
	cacheIdentityEndpoints()
	token := upgradeToken(endpoints.TokenEndpoint, s.Token.RefreshToken, account.Metadata.GUID)
	return AccountSession{Token: token}
}

func (s *AccountSession) GetObjectStorageResources() Resources {
	resources := getResources(s.Token.AccessToken, "dff97f5c-bc5e-4455-b470-411c3edbe49c")
	if resources.NextURL != nil {
		// TODO: get the rest of the resources.
		panic("boom")
	}
	return resources
}

func (s *AccountSession) GetMachineLearningResources() Resources {
	resources := getResources(s.Token.AccessToken, "51c53b72-918f-4869-b834-2d99eb28422a")
	if resources.NextURL != nil {
		// TODO: get the rest of the resources.
		panic("boom")
	}
	return resources
}

func (s *AccountSession) GetCredentials(params GetCredentialsParams) Credentials {
	credentials := getCredentials(s.Token.AccessToken, params)
	if credentials.NextURL != nil {
		// TODO: this should normally only ever return 1, but we should still get
		// the rest. (could technically return hundreds)
		panic("boom")
	}
	return credentials
}

func (s *AccountSession) CreateCredential(params CreateCredentialParams) Credential {
	return createCredential(s.Token.AccessToken, params)
}
