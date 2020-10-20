package ibmcloud

// NOTE: some of the timestamps are malformed and we don't care about dates, so parse them as strings.

type GetCredentialsParams struct {
	Name string
	Crn  string
}

type CreateCredentialParams struct {
	Name       string         `json:"name"`
	Source     string         `json:"source"`
	Role       string         `json:"role"`
	Parameters HMACParameters `json:"parameters"`
}

type HMACParameters struct {
	HMAC bool `json:"HMAC"`
}

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
	NextURL      *string   `json:"next_url"`
	TotalResults int       `json:"total_results"`
	Resources    []Account `json:"resources"`
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

type Resources struct {
	RowsCount int        `json:"rows_count"`
	NextURL   *string    `json:"next_url"`
	Resources []Resource `json:"resources"`
}

type PlanHistory struct {
	ResourcePlanID string `json:"resource_plan_id"`
	StartDate      string `json:"start_date"`
	RequestorID    string `json:"requestor_id"`
}

type Resource struct {
	ID                  string        `json:"id"`
	GUID                string        `json:"guid"`
	URL                 string        `json:"url"`
	CreatedAt           string        `json:"created_at"`
	UpdatedAt           string        `json:"updated_at"`
	DeletedAt           interface{}   `json:"deleted_at"`
	CreatedBy           string        `json:"created_by"`
	UpdatedBy           string        `json:"updated_by"`
	DeletedBy           string        `json:"deleted_by"`
	ScheduledReclaimAt  interface{}   `json:"scheduled_reclaim_at"`
	RestoredAt          interface{}   `json:"restored_at"`
	ScheduledReclaimBy  string        `json:"scheduled_reclaim_by"`
	RestoredBy          string        `json:"restored_by"`
	Name                string        `json:"name"`
	RegionID            string        `json:"region_id"`
	AccountID           string        `json:"account_id"`
	ResourcePlanID      string        `json:"resource_plan_id"`
	ResourceGroupID     string        `json:"resource_group_id"`
	ResourceGroupCrn    string        `json:"resource_group_crn"`
	TargetCrn           string        `json:"target_crn"`
	Crn                 string        `json:"crn"`
	State               string        `json:"state"`
	Type                string        `json:"type"`
	ResourceID          string        `json:"resource_id"`
	DashboardURL        string        `json:"dashboard_url"`
	LastOperation       interface{}   `json:"last_operation"`
	ResourceAliasesURL  string        `json:"resource_aliases_url"`
	ResourceBindingsURL string        `json:"resource_bindings_url"`
	ResourceKeysURL     string        `json:"resource_keys_url"`
	PlanHistory         []PlanHistory `json:"plan_history"`
	Migrated            bool          `json:"migrated"`
	ControlledBy        string        `json:"controlled_by"`
}

type Credentials struct {
	RowsCount int          `json:"rows_count"`
	NextURL   interface{}  `json:"next_url"`
	Resources []Credential `json:"resources"`
}

type CosHmacKeys struct {
	AccessKeyID     string `json:"access_key_id"`
	SecretAccessKey string `json:"secret_access_key"`
}

type CredentialSet struct {
	Apikey               string      `json:"apikey"`
	CosHmacKeys          CosHmacKeys `json:"cos_hmac_keys"`
	Endpoints            string      `json:"endpoints"`
	IamApikeyDescription string      `json:"iam_apikey_description"`
	IamApikeyName        string      `json:"iam_apikey_name"`
	IamRoleCrn           string      `json:"iam_role_crn"`
	IamServiceidCrn      string      `json:"iam_serviceid_crn"`
	ResourceInstanceID   string      `json:"resource_instance_id"`
}

type Credential struct {
	ID                  string        `json:"id"`
	GUID                string        `json:"guid"`
	URL                 string        `json:"url"`
	CreatedAt           string        `json:"created_at"`
	UpdatedAt           string        `json:"updated_at"`
	DeletedAt           interface{}   `json:"deleted_at"`
	CreatedBy           string        `json:"created_by"`
	UpdatedBy           string        `json:"updated_by"`
	DeletedBy           string        `json:"deleted_by"`
	SourceCrn           string        `json:"source_crn"`
	Name                string        `json:"name"`
	Role                string        `json:"role"`
	Crn                 string        `json:"crn"`
	State               string        `json:"state"`
	AccountID           string        `json:"account_id"`
	ResourceGroupID     string        `json:"resource_group_id"`
	ResourceID          string        `json:"resource_id"`
	Credentials         CredentialSet `json:"credentials"`
	IamCompatible       bool          `json:"iam_compatible"`
	Migrated            bool          `json:"migrated"`
	ResourceInstanceURL string        `json:"resource_instance_url"`
	ResourceAliasURL    interface{}   `json:"resource_alias_url"`
}

type Target struct {
	Type string `json:"type"`
	Name string `json:"name"`
}
type Error struct {
	Code     string `json:"code"`
	Message  string `json:"message"`
	MoreInfo string `json:"more_info"`
	Target   Target `json:"target"`
}
type ErrorMessage struct {
	ErrorDescription string  `json:"error_description"`
	Trace            string  `json:"trace"`
	Error            []Error `json:"error"`
	Errors           []Error `json:"errors"`
}
