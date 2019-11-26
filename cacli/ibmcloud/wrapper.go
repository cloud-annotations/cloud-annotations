package ibmcloud

import (
	"encoding/json"
	"io/ioutil"
	"os"
)

var endpoints IdentityEndpoints
var endpointSet = false // idk how to null/undefined check...

func cacheIdentityEndpoints() error {
	if !endpointSet {
		var err error
		endpoints, err = getIdentityEndpoints()
		if err != nil {
			return err
		}
		endpointSet = true
	}
	return nil
}

func GetIdentityEndpoints() (IdentityEndpoints, error) {
	err := cacheIdentityEndpoints()
	if err != nil {
		return IdentityEndpoints{}, err
	}
	return endpoints, nil
}

type Session struct {
	Token Token
}

func Authenticate(otp string) (Session, error) {
	err := cacheIdentityEndpoints()
	if err != nil {
		return Session{}, err
	}
	token, err := getToken(endpoints.TokenEndpoint, otp)
	if err != nil {
		return Session{}, err
	}
	return Session{Token: token}, nil
}

func AuthenticateFromFile(filepath string) (AccountSession, error) {
	err := cacheIdentityEndpoints()
	if err != nil {
		return AccountSession{}, err
	}

	jsonFile, err := os.Open(filepath)
	if err != nil {
		return AccountSession{}, err
	}
	defer jsonFile.Close()

	byteValue, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		return AccountSession{}, err
	}

	var token Token
	json.Unmarshal(byteValue, &token)

	upgradedToken, err := upgradeToken(endpoints.TokenEndpoint, token.RefreshToken, "")
	if err != nil {
		return AccountSession{}, err
	}
	return AccountSession{Token: upgradedToken}, nil
}

func (s *Session) GetAccounts() (Accounts, error) {
	accounts, err := getAccounts(s.Token.AccessToken)
	if err != nil {
		return Accounts{}, err
	}
	if accounts.NextURL != nil {
		// TODO: get the rest of the accounts.
		panic("boom")
	}
	return accounts, nil
}

type AccountSession struct {
	Token Token
}

func (s *Session) BindAccountToToken(account Account) (AccountSession, error) {
	err := cacheIdentityEndpoints()
	if err != nil {
		return AccountSession{}, err
	}
	token, err := upgradeToken(endpoints.TokenEndpoint, s.Token.RefreshToken, account.Metadata.GUID)
	if err != nil {
		return AccountSession{}, err
	}
	return AccountSession{Token: token}, nil
}

func (s *AccountSession) GetObjectStorageResources() (Resources, error) {
	resources, err := getResources(s.Token.AccessToken, "dff97f5c-bc5e-4455-b470-411c3edbe49c")
	if err != nil {
		return Resources{}, err
	}
	if resources.NextURL != nil {
		// TODO: get the rest of the resources.
		panic("boom")
	}
	return resources, nil
}

func (s *AccountSession) GetMachineLearningResources() (Resources, error) {
	resources, err := getResources(s.Token.AccessToken, "51c53b72-918f-4869-b834-2d99eb28422a")
	if err != nil {
		return Resources{}, err
	}
	if resources.NextURL != nil {
		// TODO: get the rest of the resources.
		panic("boom")
	}
	return resources, nil
}

func (s *AccountSession) GetCredentials(params GetCredentialsParams) (Credentials, error) {
	credentials, err := getCredentials(s.Token.AccessToken, params)
	if err != nil {
		return Credentials{}, err
	}
	if credentials.NextURL != nil {
		// TODO: this should normally only ever return 1, but we should still get
		// the rest. (could technically return hundreds)
		panic("boom")
	}
	return credentials, nil
}

func (s *AccountSession) CreateCredential(params CreateCredentialParams) (Credential, error) {
	credential, err := createCredential(s.Token.AccessToken, params)
	if err != nil {
		return Credential{}, err
	}
	return credential, nil
}
