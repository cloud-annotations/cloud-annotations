package ibmcloud

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/cloud-annotations/training/cacli/e"
	"github.com/davecgh/go-spew/spew"
	"github.com/mitchellh/go-homedir"
)

var endpoints *IdentityEndpoints

func cacheIdentityEndpoints() error {
	if endpoints == nil {
		var err error
		endpoints, err = getIdentityEndpoints()
		if err != nil {
			return err
		}
	}
	return nil
}

func GetIdentityEndpoints() (*IdentityEndpoints, error) {
	err := cacheIdentityEndpoints()
	if err != nil {
		return nil, err
	}
	return endpoints, nil
}

type Session struct {
	Token *Token
}

func Authenticate(otp string) (*Session, error) {
	err := cacheIdentityEndpoints()
	if err != nil {
		return nil, err
	}
	token, err := getToken(endpoints.TokenEndpoint, otp)
	if err != nil {
		return nil, err
	}
	return &Session{Token: token}, nil
}

func AuthenticateFromFile(filepath string) (*AccountSession, error) {
	err := cacheIdentityEndpoints()
	if err != nil {
		return nil, err
	}

	jsonFile, err := os.Open(filepath)
	if err != nil {
		return nil, err
	}
	defer jsonFile.Close()

	byteValue, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		return nil, err
	}

	var token Token
	json.Unmarshal(byteValue, &token)

	upgradedToken, err := upgradeToken(endpoints.TokenEndpoint, token.RefreshToken, "")
	if err != nil {
		return nil, err
	}
	return &AccountSession{Token: upgradedToken}, nil
}

func (s *Session) GetAccounts() (*Accounts, error) {
	accounts, err := getAccounts(s.Token.AccessToken)
	if err != nil {
		return nil, err
	}
	if accounts.NextURL != nil {
		// TODO: get the rest of the accounts.
		panic("boom")
	}
	return accounts, nil
}

type AccountSession struct {
	Token *Token
}

func (s *Session) BindAccountToToken(account Account) (*AccountSession, error) {
	err := cacheIdentityEndpoints()
	if err != nil {
		return nil, err
	}
	token, err := upgradeToken(endpoints.TokenEndpoint, s.Token.RefreshToken, account.Metadata.GUID)
	if err != nil {
		return nil, err
	}
	return &AccountSession{Token: token}, nil
}

func (s *AccountSession) GetObjectStorageResources() (*Resources, error) {
	resources, err := getResources(s.Token.AccessToken, "dff97f5c-bc5e-4455-b470-411c3edbe49c")
	if err != nil {
		return nil, err
	}
	if resources.NextURL != nil {
		// TODO: get the rest of the resources.
		panic("boom")
	}
	return resources, nil
}

func (s *AccountSession) GetMachineLearningResources() (*Resources, error) {
	resources, err := getResources(s.Token.AccessToken, "51c53b72-918f-4869-b834-2d99eb28422a")
	if err != nil {
		return nil, err
	}
	if resources.NextURL != nil {
		// TODO: get the rest of the resources.
		panic("boom")
	}
	return resources, nil
}

func (s *AccountSession) GetCredentials(params GetCredentialsParams) (*Credentials, error) {
	credentials, err := getCredentials(s.Token.AccessToken, params)
	if err != nil {
		return nil, err
	}
	if credentials.NextURL != nil {
		// TODO: this should normally only ever return 1, but we should still get
		// the rest. (could technically return hundreds)
		panic("boom")
	}
	return credentials, nil
}

func (s *AccountSession) CreateCredential(params CreateCredentialParams) (*Credential, error) {
	credential, err := createCredential(s.Token.AccessToken, params)
	if err != nil {
		return nil, err
	}
	return credential, nil
}

func (s *AccountSession) StartTraining(trainingZip string) {
	home, err := homedir.Dir()
	if err != nil {
		e.Exit(err)
	}
	jsonFile, err := os.Open(home + "/.cacli/wml.json")
	if err != nil {
		panic(err)
	}
	defer jsonFile.Close()

	byteValue, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		panic(err)
	}

	var resource = &Resource{}
	json.Unmarshal(byteValue, resource)

	// TODO: look into actual url from regionID
	var endpoint = "https://" + resource.RegionID + ".ml.cloud.ibm.com"

	trainingDefinition := &TrainingDefinition{
		Name: "my-first-go",
		Framework: Framework{
			Name:    "tensorflow",
			Version: "1.12",
			Runtimes: []Runtimes{
				Runtimes{
					Name:    "python",
					Version: "3.6",
				},
			},
		},
	}

	res, err := postTrainingDefinition(endpoint, s.Token.AccessToken, resource.GUID, trainingDefinition)
	if err != nil {
		panic(err)
	}

	xxx, err := AddTrainingScript(res.Entity.TrainingDefinitionVersion.ContentURL, s.Token.AccessToken, resource.GUID, trainingZip)
	if err != nil {
		panic(err)
	}

	spew.Dump(xxx)
}

func AddTrainingScript(endpoint string, token string, instanceID string, trainingZip string) (*TrainingScriptRes, error) {
	var body io.Reader
	if trainingZip != "" {
		file, err := os.Open(trainingZip)
		if err != nil {
			return nil, err
		}
		defer file.Close()
		body = bufio.NewReader(file)
	} else {
		// TODO: get actual version.
		version := "1.2.1"
		endpoint := fmt.Sprintf("https://github.com/cloud-annotations/training/releases/download/v%s/training.zip", version)
		request, err := http.NewRequest(http.MethodGet, endpoint, nil)
		if err != nil {
			return nil, err
		}

		resp, err := client.Do(request)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()
		body = resp.Body
	}

	res, err := putTrainingDefinition(endpoint, token, instanceID, body)
	if err != nil {
		return nil, err
	}

	return res, nil
}
