package ibmcloud

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"time"

	"github.com/IBM/ibm-cos-sdk-go/aws"
	"github.com/IBM/ibm-cos-sdk-go/aws/credentials"
	"github.com/IBM/ibm-cos-sdk-go/aws/session"
	"github.com/IBM/ibm-cos-sdk-go/service/s3"
	"github.com/cloud-annotations/training/cacli/ibmcloud/run"
	"github.com/mitchellh/go-homedir"
	"golang.org/x/time/rate"
	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

// TODO: make a helper function for loading in config files.

var regionMap = map[string]string{
	"us":         "us",
	"us-geo":     "us",
	"dal.us":     "dal.us",
	"dal-us-geo": "dal.us",
	"wdc.us":     "wdc.us",
	"wdc-us-geo": "wdc.us",
	"sjc.us":     "sjc.us",
	"sjc-us-geo": "sjc.us",
	"eu":         "eu",
	"eu-geo":     "eu",
	"ams.eu":     "ams.eu",
	"ams-eu-geo": "ams.eu",
	"fra.eu":     "fra.eu",
	"fra-eu-geo": "fra.eu",
	"mil.eu":     "mil.eu",
	"mil-eu-geo": "mil.eu",
	"ap":         "ap",
	"ap-geo":     "ap",
	"tok.ap":     "tok.ap",
	"tok-ap-geo": "tok.ap",
	"seo.ap":     "seo.ap",
	"seo-ap-geo": "seo.ap",
	"hkg.ap":     "hkg.ap",
	"hkg-ap-geo": "hkg.ap",
	"us-south":   "us-south",
	"us-east":    "us-east",
	"eu-gb":      "eu-gb",
	"eu-de":      "eu-de",
	"jp-tok":     "jp-tok",
	"au-syd":     "au-syd",
	"ams03":      "ams03",
	"che01":      "che01",
	"mel01":      "mel01",
	"osl01":      "osl01",
	"tor01":      "tor01",
	"sao01":      "sao01",
	"seo01":      "seo01",
	"mon01":      "mon01",
	"mex01":      "mex01",
	"sjc04":      "sjc04",
	"mil01":      "mil01",
	"hkg02":      "hkg02",
}

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

func (s *AccountSession) StartTraining(trainingZip string, bucket *s3.BucketExtended, steps int, gpu string) (*Model, error) {
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

	locationWithType := *bucket.LocationConstraint

	re, err := regexp.Compile("-standard$|-vault$|-cold$|-flex$")
	if err != nil {
		return nil, err
	}

	location := re.ReplaceAllString(locationWithType, "")
	cosEndpoint := "https://s3.private." + regionMap[location] + ".cloud-object-storage.appdomain.cloud"

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
				Command: `cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && chmod 777 ./start.sh && ./start.sh ` + strconv.Itoa(steps),
				ComputeConfiguration: &run.ComputeConfiguration{
					Name: gpu,
				},
			},
		},
		TrainingDataReference: &run.TrainingDataReference{
			Connection: &run.Connection{
				EndpointURL:     cosEndpoint,
				AccessKeyID:     creds.Resources[0].Credentials.CosHmacKeys.AccessKeyID,
				SecretAccessKey: creds.Resources[0].Credentials.CosHmacKeys.SecretAccessKey,
			},
			Source: &run.Source{
				Bucket: *bucket.Name,
			},
			Type: "s3",
		},
		TrainingResultsReference: &run.TrainingResultsReference{
			Connection: &run.Connection{
				EndpointURL:     cosEndpoint,
				AccessKeyID:     creds.Resources[0].Credentials.CosHmacKeys.AccessKeyID,
				SecretAccessKey: creds.Resources[0].Credentials.CosHmacKeys.SecretAccessKey,
			},
			Target: &run.Target{
				Bucket: *bucket.Name,
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

func (s *AccountSession) ListAllBucket() (*s3.ListBucketsExtendedOutput, error) {
	// TODO: get all buckets.
	// TODO: cache the credentials.
	home, err := homedir.Dir()
	if err != nil {
		return nil, err
	}
	jsonFile, err := os.Open(home + "/.cacli/cos.json")
	if err != nil {
		return nil, err
	}
	defer jsonFile.Close()

	byteValue, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		return nil, err
	}

	cosResource := &Resource{}
	json.Unmarshal(byteValue, cosResource)

	creds, err := s.GetCredentials(GetCredentialsParams{
		Name: "cloud-annotations-binding",
		Crn:  cosResource.Crn,
	})

	sess := session.Must(session.NewSession())
	client := s3.New(sess, &aws.Config{
		Region:           aws.String("none"), // sdk is dumb and needs this...
		Endpoint:         aws.String("https://s3.us.cloud-object-storage.appdomain.cloud"),
		S3ForcePathStyle: aws.Bool(true),
		Credentials:      credentials.NewStaticCredentials(creds.Resources[0].Credentials.CosHmacKeys.AccessKeyID, creds.Resources[0].Credentials.CosHmacKeys.SecretAccessKey, ""),
	})
	list, err := client.ListBucketsExtended(&s3.ListBucketsExtendedInput{})
	if err != nil {
		return nil, err
	}
	return list, nil
}

func (s *AccountSession) ListTrainingRuns() (*Models, error) {
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

	models, err := getModels(endpoint, s.Token.AccessToken, wmlResource.GUID)
	if err != nil {
		return nil, err
	}
	return models, nil
}

func (s *AccountSession) Sockittoome(modelID string) {
	home, err := homedir.Dir()
	if err != nil {
		panic(err)
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

	wmlResource := &Resource{}
	json.Unmarshal(byteValue, wmlResource)

	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	endpoint := "wss://" + wmlResource.RegionID + ".ml.cloud.ibm.com/v3/models/" + modelID + "/monitor"
	c, _, err := websocket.Dial(ctx, endpoint, &websocket.DialOptions{
		HTTPHeader: http.Header{
			"Authorization":  {"bearer " + s.Token.AccessToken},
			"ML-Instance-ID": {wmlResource.GUID},
		},
	})
	if err != nil {
		panic(err)
	}
	defer c.Close(websocket.StatusInternalError, "the sky is falling")

	l := rate.NewLimiter(rate.Every(time.Millisecond*100), 10)
	for {
		err = l.Wait(ctx)
		if err != nil {
			panic(err)
		}

		var v interface{}
		err = wsjson.Read(ctx, c, &v)
		if err != nil {
			panic(err)
		}
		log.Printf("received: %v", v)
	}
	// c.Close(websocket.StatusNormalClosure, "")
}
