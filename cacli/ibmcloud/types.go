package ibmcloud

// NOTE: some of the timestamps are malformed and we don't care about dates, so parse them as strings.

type IdentityEndpoints struct {
	Issuer                            string   `json:"issuer"`
	AuthorizationEndpoint             string   `json:"authorization_endpoint"`
	TokenEndpoint                     string   `json:"token_endpoint"`
	PasscodeEndpoint                  string   `json:"passcode_endpoint"`
	UserinfoEndpoint                  string   `json:"userinfo_endpoint"`
	JwksURI                           string   `json:"jwks_uri"`
	ResponseTypesSupported            []string `json:"response_types_supported"`
	GrantTypesSupported               []string `json:"grant_types_supported"`
	SubjectTypesSupported             []string `json:"subject_types_supported"`
	TokenEndpointAuthMethodsSupported []string `json:"token_endpoint_auth_methods_supported"`
	IDTokenSigningAlgValuesSupported  []string `json:"id_token_signing_alg_values_supported"`
	ScopesSupported                   []string `json:"scopes_supported"`
	ClaimsSupported                   []string `json:"claims_supported"`
}

type Token struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	Expiration   int    `json:"expiration"`
	Scope        string `json:"scope"`
}

type Accounts struct {
	NextURL      interface{} `json:"next_url"`
	TotalResults int         `json:"total_results"`
	Resources    []Account   `json:"resources"`
}

type Metadata struct {
	GUID      string `json:"guid"`
	URL       string `json:"url"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type OrganizationsRegion struct {
	GUID   string `json:"guid"`
	Region string `json:"region"`
}

type Linkages struct {
	Origin string `json:"origin"`
	State  string `json:"state"`
}

type TermsAndConditions struct {
	Accepted  bool   `json:"accepted"`
	Timestamp string `json:"timestamp"`
}

type Subscriptions struct {
	PlanID                       string `json:"planId"`
	PartNumber                   string `json:"partNumber"`
	AccountID                    string `json:"accountId"`
	StartDate                    string `json:"startDate"`
	EndDate                      string `json:"endDate"`
	NumberOfInstancesAllowed     string `json:"numberOfInstancesAllowed"`
	OrderReferenceNumber         string `json:"orderReferenceNumber"`
	AddedBy                      string `json:"addedBy"`
	GUID                         string `json:"guid"`
	NumberOfInstancesProvisioned string `json:"numberOfInstancesProvisioned,omitempty"`
}

type History struct {
	Type               string `json:"type"`
	State              string `json:"state"`
	StartTime          string `json:"startTime"`
	EndTime            string `json:"endTime"`
	CurrencyCode       string `json:"currencyCode"`
	CountryCode        string `json:"countryCode"`
	BillingCountryCode string `json:"billingCountryCode"`
}

type PaymentMethod struct {
	Type           string      `json:"type"`
	Started        string      `json:"started"`
	Ended          string      `json:"ended"`
	CurrencyCode   string      `json:"currencyCode"`
	AnniversaryDay interface{} `json:"anniversaryDay"` // most are int some are string...
}

type BluemixSubscriptions struct {
	Type                  string        `json:"type"`
	State                 string        `json:"state"`
	PaymentMethod         PaymentMethod `json:"payment_method"`
	SubscriptionID        string        `json:"subscription_id"`
	PartNumber            string        `json:"part_number"`
	SubscriptionTags      []interface{} `json:"subscriptionTags"`
	PaygPendingTimestamp  string        `json:"payg_pending_timestamp"`
	History               []interface{} `json:"history"`
	CurrentStateTimestamp string        `json:"current_state_timestamp"`
	SoftlayerAccountID    string        `json:"softlayer_account_id"`
	BillingSystem         string        `json:"billing_system"`
	AdditionalCharges     []interface{} `json:"additional_charges"`
}

type Entity struct {
	Name                 string                 `json:"name"`
	Type                 string                 `json:"type"`
	State                string                 `json:"state"`
	Owner                string                 `json:"owner"`
	OwnerUserid          string                 `json:"owner_userid"`
	OwnerUniqueID        string                 `json:"owner_unique_id"`
	OwnerIamID           string                 `json:"owner_iam_id"`
	CustomerID           string                 `json:"customer_id"`
	CountryCode          string                 `json:"country_code"`
	CurrencyCode         string                 `json:"currency_code"`
	BillingCountryCode   string                 `json:"billing_country_code"`
	IsIBMer              bool                   `json:"isIBMer"`
	TermsAndConditions   TermsAndConditions     `json:"terms_and_conditions"`
	MigratedState        string                 `json:"migrated_state"`
	Tags                 []interface{}          `json:"tags"`
	TeamDirectoryEnabled bool                   `json:"team_directory_enabled"`
	OrganizationsRegion  []OrganizationsRegion  `json:"organizations_region"`
	Linkages             []Linkages             `json:"linkages"`
	Subscriptions        []Subscriptions        `json:"subscriptions"`
	BluemixSubscriptions []BluemixSubscriptions `json:"bluemix_subscriptions"`
	SubscriptionID       string                 `json:"subscription_id"`
	ConfigurationID      string                 `json:"configuration_id"`
	Onboarded            int                    `json:"onboarded"`
}

type Account struct {
	Metadata Metadata `json:"metadata"`
	Entity   Entity   `json:"entity"`
}
