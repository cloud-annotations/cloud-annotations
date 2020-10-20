package ibmcloud

import (
	"bufio"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"

	"github.com/cloud-annotations/training/cacli/version"

	"github.com/IBM/ibm-cos-sdk-go/aws"
	"github.com/IBM/ibm-cos-sdk-go/aws/credentials"
	"github.com/IBM/ibm-cos-sdk-go/aws/session"
	"github.com/IBM/ibm-cos-sdk-go/service/s3"
	"github.com/IBM/ibm-cos-sdk-go/service/s3/s3manager"
	"github.com/cloud-annotations/training/cacli/ibmcloud/run"
	"github.com/mitchellh/go-homedir"
	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

type Session struct {
	Token *Token
}

type AccountSession struct {
	Token *Token
}

type CredentialSession struct {
	Token           *Token
	AccessKeyID     string
	SecretAccessKey string
	InstanceID      string
	URL             string
}

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

func shouldDownloadFile(fileName string, modelsToDownload []string) bool {
	if len(modelsToDownload) > 0 {
		shouldDownload := false
		// if the current file is in one of the folders download it.
		for _, folder := range modelsToDownload {
			shouldDownload = shouldDownload || strings.HasPrefix(fileName, folder)
		}
		return shouldDownload
	}
	// if no models listed download all.
	return true
}

func getResourceConfig(path string) (*Resource, error) {
	home, err := homedir.Dir()
	if err != nil {
		return nil, err
	}
	jsonFile, err := os.Open(home + path)
	if err != nil {
		return nil, err
	}
	defer jsonFile.Close()

	byteValue, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		return nil, err
	}

	resource := &Resource{}
	err = json.Unmarshal(byteValue, resource)
	if err != nil {
		return nil, err
	}

	return resource, nil
}

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

func AuthenticateFromFile(filepath string) (*CredentialSession, error) {
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
	err = json.Unmarshal(byteValue, &token)
	if err != nil {
		return nil, err
	}

	upgradedToken, err := upgradeToken(endpoints.TokenEndpoint, token.RefreshToken, "")
	if err != nil {
		return nil, err
	}

	s := &AccountSession{Token: upgradedToken}

	// Get HMAC credentials.
	cosResource, err := getResourceConfig("/.cacli/cos.json")
	if err != nil {
		return nil, err
	}

	creds, err := s.GetCredentials(GetCredentialsParams{
		Name: "cloud-annotations-binding",
		Crn:  cosResource.Crn,
	})
	if err != nil {
		return nil, err
	}

	// Get WML info.
	wmlResource, err := getResourceConfig("/.cacli/wml.json")
	if err != nil {
		return nil, err
	}

	// TODO: look into actual url from regionID.
	// TODO: check if there is at least 1 resource so we don't crash.
	credentialSession := &CredentialSession{
		Token:           upgradedToken,
		AccessKeyID:     creds.Resources[0].Credentials.CosHmacKeys.AccessKeyID,
		SecretAccessKey: creds.Resources[0].Credentials.CosHmacKeys.SecretAccessKey,
		InstanceID:      wmlResource.GUID,
		URL:             "https://" + wmlResource.RegionID + ".ml.cloud.ibm.com",
	}
	return credentialSession, nil
}

func AuthenticateFromCredentials(wmlInstanceID, wmlAPIKey, wmlURL, cosAccessKey, cosSecretKey string) (*CredentialSession, error) {
	err := cacheIdentityEndpoints()
	if err != nil {
		return nil, err
	}
	token, err := getTokenFromIAM(endpoints.TokenEndpoint, wmlAPIKey)
	if err != nil {
		return nil, err
	}
	credentialSession := &CredentialSession{Token: token,
		AccessKeyID:     cosAccessKey,
		SecretAccessKey: cosSecretKey,
		InstanceID:      wmlInstanceID,
		URL:             wmlURL, // TODO: we should make sure this doesn't end in "/".
	}
	return credentialSession, nil
}

func (s *Session) GetAccounts() (*Accounts, error) {
	return s.GetAccountsWithEndpoint(nil)
}

func (s *Session) GetAccountsWithEndpoint(nextURL *string) (*Accounts, error) {
	accounts, err := getAccounts(nextURL, s.Token.AccessToken)
	if err != nil {
		return nil, err
	}
	if accounts.NextURL != nil {
		nextAccounts, err := s.GetAccountsWithEndpoint(accounts.NextURL)
		if err != nil {
			return nil, err
		}
		nextAccounts.Resources = append(nextAccounts.Resources, accounts.Resources...)
		return nextAccounts, nil
	}
	return accounts, nil
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
	return s.GetObjectStorageResourcesWithEndpoint(nil)
}

func (s *AccountSession) GetObjectStorageResourcesWithEndpoint(nextURL *string) (*Resources, error) {
	resources, err := getResources(nextURL, s.Token.AccessToken, "dff97f5c-bc5e-4455-b470-411c3edbe49c")
	if err != nil {
		return nil, err
	}
	if resources.NextURL != nil {
		nextResources, err := s.GetObjectStorageResourcesWithEndpoint(resources.NextURL)
		if err != nil {
			return nil, err
		}
		nextResources.Resources = append(nextResources.Resources, resources.Resources...)
		return nextResources, nil
	}
	return resources, nil
}

func (s *AccountSession) GetMachineLearningResources() (*Resources, error) {
	return s.GetMachineLearningResourcesWithEndpoint(nil)
}

func (s *AccountSession) GetMachineLearningResourcesWithEndpoint(nextURL *string) (*Resources, error) {
	resources, err := getResources(nextURL, s.Token.AccessToken, "51c53b72-918f-4869-b834-2d99eb28422a")
	if err != nil {
		return nil, err
	}
	if resources.NextURL != nil {
		nextResources, err := s.GetMachineLearningResourcesWithEndpoint(resources.NextURL)
		if err != nil {
			return nil, err
		}
		nextResources.Resources = append(nextResources.Resources, resources.Resources...)
		return nextResources, nil
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

func (s *CredentialSession) StartTraining(trainingZip string, projectName string, bucket *s3.BucketExtended, output *s3.BucketExtended, steps int, gpu string, framework string, frameworkVersion string, pythonVersion string) (*Model, error) {
	// TODO: We shouldn't hard code all of this.
	trainingDefinition := &TrainingDefinition{
		Name: projectName,
		Framework: Framework{
			Name:    framework,
			Version: frameworkVersion,
			Runtimes: []Runtimes{
				Runtimes{
					Name:    "python",
					Version: pythonVersion,
				},
			},
		},
	}

	res, err := postTrainingDefinition(s.URL, s.Token.AccessToken, s.InstanceID, trainingDefinition)
	if err != nil {
		return nil, err
	}

	_, err = s.addTrainingScript(res.Entity.TrainingDefinitionVersion.ContentURL, trainingZip)
	if err != nil {
		return nil, err
	}

	re, err := regexp.Compile("-standard$|-vault$|-cold$|-flex$")
	if err != nil {
		return nil, err
	}

	locationWithType := *bucket.LocationConstraint
	location := re.ReplaceAllString(locationWithType, "")
	cosEndpoint := "https://s3.private." + regionMap[location] + ".cloud-object-storage.appdomain.cloud"

	if output == nil {
		output = bucket
	}

	outputLocationWithType := *output.LocationConstraint
	outputLocation := re.ReplaceAllString(outputLocationWithType, "")
	outputCosEndpoint := "https://s3.private." + regionMap[outputLocation] + ".cloud-object-storage.appdomain.cloud"

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
				AccessKeyID:     s.AccessKeyID,
				SecretAccessKey: s.SecretAccessKey,
			},
			Source: &run.Source{
				Bucket: *bucket.Name,
			},
			Type: "s3",
		},
		TrainingResultsReference: &run.TrainingResultsReference{
			Connection: &run.Connection{
				EndpointURL:     outputCosEndpoint,
				AccessKeyID:     s.AccessKeyID,
				SecretAccessKey: s.SecretAccessKey,
			},
			Target: &run.Target{
				Bucket: *output.Name,
			},
			Type: "s3",
		},
	}

	model, err := postModel(s.URL, s.Token.AccessToken, s.InstanceID, trainingRun)
	if err != nil {
		return nil, err
	}

	return model, nil
}

func (s *CredentialSession) addTrainingScript(endpoint string, trainingZip string) (*TrainingScriptRes, error) {
	var body io.Reader
	if strings.HasPrefix(trainingZip, "http") {
		request, err := http.NewRequest(http.MethodGet, trainingZip, nil)
		if err != nil {
			return nil, err
		}

		resp, err := client.Do(request)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()
		body = resp.Body
	} else if trainingZip != "" {
		file, err := os.Open(trainingZip)
		if err != nil {
			return nil, err
		}
		defer file.Close()
		body = bufio.NewReader(file)
	} else {
		version := version.BuildVersion()
		endpoint := fmt.Sprintf("https://github.com/cloud-annotations/training/releases/download/v%s/training.zip", version)
		if version == "dev" {
			endpoint = "https://github.com/cloud-annotations/training/releases/latest/download/training.zip"
		}
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

	res, err := putTrainingDefinition(endpoint, s.Token.AccessToken, s.InstanceID, body)
	if err != nil {
		return nil, err
	}

	return res, nil
}

func (s *CredentialSession) ListAllBucket() (*s3.ListBucketsExtendedOutput, error) {
	sess, err := session.NewSession(&aws.Config{
		Region:           aws.String("none"), // sdk is dumb and needs this...
		Endpoint:         aws.String("https://s3.us.cloud-object-storage.appdomain.cloud"),
		S3ForcePathStyle: aws.Bool(true),
		Credentials:      credentials.NewStaticCredentials(s.AccessKeyID, s.SecretAccessKey, ""),
	})
	if err != nil {
		return nil, err
	}

	client := s3.New(sess)

	list := &s3.ListBucketsExtendedOutput{}
	err = client.ListBucketsExtendedPages(&s3.ListBucketsExtendedInput{},
		func(page *s3.ListBucketsExtendedOutput, lastPage bool) bool {
			list.Buckets = append(list.Buckets, page.Buckets...)
			return !lastPage
		})

	if err != nil {
		return nil, err
	}
	return list, nil
}

func (s *CredentialSession) ListTrainingRuns() (*Models, error) {
	return getModels(s.URL, s.Token.AccessToken, s.InstanceID)
}

func (s *CredentialSession) GetTrainingRun(modelID string) (*Model, error) {
	return getModel(s.URL, s.Token.AccessToken, s.InstanceID, modelID)
}

func (s *CredentialSession) DownloadDirs(bucket string, modelLocation string, modelID string, modelsToDownload []string) error {
	cosEndpoint, err := s.GetEndpointForBucket(bucket)
	if err != nil {
		return err
	}

	sess, err := session.NewSession(&aws.Config{
		Region:           aws.String("none"), // sdk is dumb and needs this...
		Endpoint:         aws.String(cosEndpoint),
		S3ForcePathStyle: aws.Bool(true),
		Credentials:      credentials.NewStaticCredentials(s.AccessKeyID, s.SecretAccessKey, ""),
	})
	if err != nil {
		return err
	}

	client := s3.New(sess)
	downloader := s3manager.NewDownloader(sess)

	objects := &s3.ListObjectsV2Output{}
	err = client.ListObjectsV2Pages(&s3.ListObjectsV2Input{
		Bucket: aws.String(bucket),
		Prefix: aws.String(modelLocation),
	},
		func(page *s3.ListObjectsV2Output, lastPage bool) bool {
			objects.Contents = append(objects.Contents, page.Contents...)
			return !lastPage
		})
	if err != nil {
		return err
	}

	objectsToDownload := []s3manager.BatchDownloadObject{}
	for _, object := range objects.Contents {
		re, err := regexp.Compile("^" + modelLocation)
		if err != nil {
			return err
		}

		fileName := re.ReplaceAllString(*object.Key, "")
		if !strings.HasSuffix(fileName, "/") && shouldDownloadFile(fileName, modelsToDownload) {
			fileName := "./" + modelID + "/" + fileName
			dirName := filepath.Dir(fileName)
			if _, err := os.Stat(dirName); err != nil {
				err := os.MkdirAll(dirName, os.ModePerm)
				if err != nil {
					return err
				}
			}
			file, err := os.Create(fileName)
			if err != nil {
				return err
			}
			defer file.Close()

			objectsToDownload = append(objectsToDownload, s3manager.BatchDownloadObject{
				Object: &s3.GetObjectInput{
					Bucket: aws.String(bucket),
					Key:    object.Key,
				},
				Writer: file,
			})
		}
	}

	iter := &s3manager.DownloadObjectsIterator{Objects: objectsToDownload}
	if err := downloader.DownloadWithIterator(aws.BackgroundContext(), iter); err != nil {
		return err
	}

	return nil
}

func (s *CredentialSession) MonitorRun(modelID string, cb func(string)) error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	endpoint := strings.Replace(s.URL+"/v3/models/"+modelID+"/monitor", "https", "wss", 1)

	c, _, err := websocket.Dial(ctx, endpoint, &websocket.DialOptions{
		HTTPHeader: http.Header{
			"Authorization":  {"bearer " + s.Token.AccessToken},
			"ML-Instance-ID": {s.InstanceID},
		},
	})
	if err != nil {
		return err
	}
	defer c.Close(websocket.StatusInternalError, "the sky is falling")

	for {
		results := &SocketMessage{}
		err = wsjson.Read(ctx, c, &results)
		if err != nil {
			return err
		}
		cb(strings.TrimSuffix(results.Status.Message, "\n"))
	}
}

func (s *CredentialSession) GetEndpointForBucket(bucket string) (string, error) {
	bucketList, err := s.ListAllBucket()
	if err != nil {
		return "", err
	}
	var bucketLocationWithType *string
	for _, element := range bucketList.Buckets {
		if *element.Name == bucket {
			bucketLocationWithType = element.LocationConstraint
		}
	}
	if bucketLocationWithType == nil {
		return "", errors.New("unable to determine bucket region")
	}

	re, err := regexp.Compile("-standard$|-vault$|-cold$|-flex$")
	if err != nil {
		return "", err
	}

	location := re.ReplaceAllString(*bucketLocationWithType, "")
	cosEndpoint := "https://s3." + regionMap[location] + ".cloud-object-storage.appdomain.cloud"

	return cosEndpoint, err
}

func (s *CredentialSession) GetObject(bucket string, key string) (*s3.GetObjectOutput, error) {
	cosEndpoint, err := s.GetEndpointForBucket(bucket)
	if err != nil {
		return nil, err
	}

	sess, err := session.NewSession(&aws.Config{
		Region:           aws.String("none"), // sdk is dumb and needs this...
		Endpoint:         aws.String(cosEndpoint),
		S3ForcePathStyle: aws.Bool(true),
		Credentials:      credentials.NewStaticCredentials(s.AccessKeyID, s.SecretAccessKey, ""),
	})
	if err != nil {
		return nil, err
	}

	client := s3.New(sess)

	res, err := client.GetObject(&s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (s *CredentialSession) CancelRun(modelID string) error {
	return cancelRun(s.URL, s.Token.AccessToken, s.InstanceID, modelID)
}
