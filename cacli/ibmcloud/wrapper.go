package ibmcloud

// TODO: return errors

var endpoints IdentityEndpoints
var endpointSet = false // idk how to null/undefined check...
var token Token
var tokenSet = false

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

func Authenticate(otp string) Token {
	if !tokenSet {
		cacheIdentityEndpoints()
		token = getToken(endpoints.TokenEndpoint, otp)
		tokenSet = true
	}
	return token
}

func GetAccounts() Accounts {
	if !tokenSet {
		panic("boom")
	}
	accounts := getAccounts(token.AccessToken)
	if accounts.NextURL != nil {
		// TODO: get the rest of the accounts.
		panic("boom")
	}
	return accounts
}

func BindAccountToToken(account Account) Token {
	if !tokenSet {
		panic("boom")
	}
	cacheIdentityEndpoints()
	token = upgradeToken(endpoints.TokenEndpoint, token.RefreshToken, account.Metadata.GUID)
	return token
}

func GetObjectStorageResources() Resources {
	if !tokenSet {
		panic("boom")
	}
	return getResources(token.AccessToken, "dff97f5c-bc5e-4455-b470-411c3edbe49c")
}

func GetMachineLearningResources() Resources {
	if !tokenSet {
		panic("boom")
	}
	return getResources(token.AccessToken, "51c53b72-918f-4869-b834-2d99eb28422a")
}

func GetCredentials(params CredentialParams) Credentials {
	return getCredentials(token.AccessToken, params)
}

func CreateCredential(objectStorageID string) Credential {
	return createCredential(token.AccessToken, objectStorageID)
}
