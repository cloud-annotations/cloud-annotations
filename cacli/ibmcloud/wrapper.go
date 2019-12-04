package ibmcloud

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/cloud-annotations/training/cacli/ibmcloud/run"
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

func (s *AccountSession) StartTraining(trainingZip string) (*Model, error) {
	home, err := homedir.Dir()
	if err != nil {
		return nil, err
	}
	jsonFile, err := os.Open(home + "/.cacli/wml.json")
	if err != nil {
		return nil, err
	}
	defer jsonFile.Close()

	byteValue, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		return nil, err
	}

	wmlResource := &Resource{}
	json.Unmarshal(byteValue, wmlResource)

	// TODO: look into actual url from regionID
	endpoint := "https://" + wmlResource.RegionID + ".ml.cloud.ibm.com"

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

	res, err := postTrainingDefinition(endpoint, s.Token.AccessToken, wmlResource.GUID, trainingDefinition)
	if err != nil {
		return nil, err
	}

	_, err = addTrainingScript(res.Entity.TrainingDefinitionVersion.ContentURL, s.Token.AccessToken, wmlResource.GUID, trainingZip)
	if err != nil {
		return nil, err
	}

	jsonFile, err = os.Open(home + "/.cacli/cos.json")
	if err != nil {
		return nil, err
	}
	defer jsonFile.Close()

	byteValue, err = ioutil.ReadAll(jsonFile)
	if err != nil {
		return nil, err
	}

	cosResource := &Resource{}
	json.Unmarshal(byteValue, cosResource)

	creds, err := s.GetCredentials(GetCredentialsParams{
		Name: "cloud-annotations-binding",
		Crn:  cosResource.Crn,
	})

	// TODO: we need a custom training run struct...
	trainingRun := &run.TrainingRun{
		ModelDefinition: &run.ModelDefinition{
			Framework: &run.Framework{
				Name:    res.Entity.Framework.Name,
				Version: res.Entity.Framework.Version,
			},
			Name:           res.Entity.Name,
			Author:         &run.Author{},
			DefinitionHref: res.Metadata.URL,
			Execution: &run.Execution{
				Command: `cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && chmod 777 ./start.sh && ./start.sh 500`,
				ComputeConfiguration: &run.ComputeConfiguration{
					Name: "k80",
				},
			},
		},
		TrainingDataReference: &run.TrainingDataReference{
			Connection: &run.Connection{
				EndpointURL:     "https://s3.us.cloud-object-storage.appdomain.cloud",
				AccessKeyID:     creds.Resources[0].Credentials.CosHmacKeys.AccessKeyID,
				SecretAccessKey: creds.Resources[0].Credentials.CosHmacKeys.SecretAccessKey,
			},
			Source: &run.Source{
				Bucket: "thumbs-up-down",
			},
			Type: "s3",
		},
		TrainingResultsReference: &run.TrainingResultsReference{
			Connection: &run.Connection{
				EndpointURL:     "https://s3.us.cloud-object-storage.appdomain.cloud",
				AccessKeyID:     creds.Resources[0].Credentials.CosHmacKeys.AccessKeyID,
				SecretAccessKey: creds.Resources[0].Credentials.CosHmacKeys.SecretAccessKey,
			},
			Target: &run.Target{
				Bucket: "thumbs-up-down",
			},
			Type: "s3",
		},
	}

	model, err := postModel(endpoint, s.Token.AccessToken, wmlResource.GUID, trainingRun)
	if err != nil {
		return nil, err
	}

	return model, nil
}

func addTrainingScript(endpoint string, token string, instanceID string, trainingZip string) (*TrainingScriptRes, error) {
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
