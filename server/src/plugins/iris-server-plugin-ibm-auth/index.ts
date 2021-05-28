/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import express from "express";

interface OAuthSettings {
  authURL: string;
  tokenURL: string;
  clientID: string;
  clientSecret: string;
  redirectURI: string;
}

console.log(process.env);

const oauthSettings = {
  github_app: {
    authURL: "https://github.com/login/oauth/authorize",
    tokenURL: "https://github.com/login/oauth/access_token",
    // clientID:     os.Getenv("GH_APP_CLIENT_ID"),
    // clientSecret: os.Getenv("GH_APP_CLIENT_SECRET"),
    redirectURI: "https://appstatic.dev/auth/done",
  },
  ibm: {
    authURL: "https://iam.cloud.ibm.com/identity/authorize",
    tokenURL: "https://iam.cloud.ibm.com/identity/token",
    clientID: process.env.IBM_LOGIN_CLIENT_ID,
    clientSecret: process.env.IBM_LOGIN_CLIENT_SECRET,
    redirectURI: process.env.IBM_REDIRECT_URI, // "https://appstatic.dev/auth/callback",
  },
};

export function authenticate(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  // res.sendStatus(401);

  console.log("session middleware");

  // 		sess, err := session.Get("as-z3zs10n", c)
  // 		if err != nil {
  // 			return err
  // 		}
  // 		fmt.Println(sess.Values["expiration"])
  // 		fmt.Println(sess.Values["access_token"])

  // 		expiration, ok := sess.Values["expiration"].(int64)
  // 		if !ok {
  // 			return res.sendStatus(401);
  // 		}

  // 		t1 := time.Unix(expiration, 0)
  // 		diff := time.Until(t1)
  // 		fmt.Println(diff)

  // 		if diff.Minutes() < 5 {
  // 			sess2, err := session.Get("as-rs3rf3r", c)
  // 			if err != nil {
  // 				return err
  // 			}
  // 			refreshToken, ok := sess2.Values["refresh_token"].(string)
  // 			if !ok {
  // 				return c.NoContent(http.StatusUnauthorized)
  // 			}

  // 			authToken, err := server.RefreshToken(refreshToken)
  // 			if err != nil {
  // 				return err
  // 			}

  // 			sess.Values["expiration"] = authToken.Expiration
  // 			sess.Values["access_token"] = authToken.AccessToken
  // 			err = sess.Save(c.Request(), c.Response())
  // 			if err != nil {
  // 				return err
  // 			}

  // 			sess2.Values["refresh_token"] = authToken.RefreshToken
  // 			err = sess2.Save(c.Request(), c.Response())
  // 			if err != nil {
  // 				return err
  // 			}
  // 		}

  next();
}

// func HandleTokens(next echo.HandlerFunc) echo.HandlerFunc {
// 	return func(c echo.Context) error {
// 		fmt.Println("session middleware")
// 		sess, err := session.Get("as-z3zs10n", c)
// 		if err != nil {
// 			return err
// 		}
// 		fmt.Println(sess.Values["expiration"])
// 		fmt.Println(sess.Values["access_token"])

// 		expiration, ok := sess.Values["expiration"].(int64)
// 		if !ok {
// 			return c.NoContent(http.StatusUnauthorized)
// 		}

// 		t1 := time.Unix(expiration, 0)
// 		diff := time.Until(t1)
// 		fmt.Println(diff)

// 		if diff.Minutes() < 5 {
// 			sess2, err := session.Get("as-rs3rf3r", c)
// 			if err != nil {
// 				return err
// 			}
// 			refreshToken, ok := sess2.Values["refresh_token"].(string)
// 			if !ok {
// 				return c.NoContent(http.StatusUnauthorized)
// 			}

// 			authToken, err := server.RefreshToken(refreshToken)
// 			if err != nil {
// 				return err
// 			}

// 			sess.Values["expiration"] = authToken.Expiration
// 			sess.Values["access_token"] = authToken.AccessToken
// 			err = sess.Save(c.Request(), c.Response())
// 			if err != nil {
// 				return err
// 			}

// 			sess2.Values["refresh_token"] = authToken.RefreshToken
// 			err = sess2.Save(c.Request(), c.Response())
// 			if err != nil {
// 				return err
// 			}
// 		}

// 		return next(c)
// 	}
// }

function refreshToken(refreshToken: string) {
  // form := url.Values{}
  // form.Set("client_id", oauthSettings["ibm"].clientID)
  // form.Set("client_secret", oauthSettings["ibm"].clientSecret)
  // form.Set("grant_type", "refresh_token")
  // form.Set("refresh_token", refreshToken)
  // client := &http.Client{}
  // req, err := http.NewRequest("POST", oauthSettings["ibm"].tokenURL, bytes.NewBufferString(form.Encode()))
  // req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
  // req.Header.Set("Accept", "application/json")
  // if err != nil {
  // 	return nil, err
  // }
  // res, err := client.Do(req)
  // if err != nil {
  // 	return nil, err
  // }
  // defer res.Body.Close()
  // data, _ := ioutil.ReadAll(res.Body)
  // authToken := AuthToken{}
  // err = json.Unmarshal(data, &authToken)
  // if err != nil {
  // 	return nil, err
  // }
  // return &authToken, nil
}

function buildRedirect(
  provider: string,
  login: boolean,
  settings: OAuthSettings
) {
  // redirectURL, err := url.Parse(settings.authURL)
  // if err != nil {
  // 	return "", err
  // }
  // token, err := token.New(token.Claims{Provider: provider, Login: login})
  // if err != nil {
  // 	return "", err
  // }
  // query := redirectURL.Query()
  // query.Set("client_id", settings.clientID)
  // query.Set("redirect_uri", settings.redirectURI)
  // query.Set("state", token)
  // redirectURL.RawQuery = query.Encode()
  // return redirectURL.String(), nil
}

function authHandler(c: any) {
  // provider := c.QueryParam("provider")
  // // We don't need to crash for bad bool parsing.
  // login, _ := strconv.ParseBool(c.QueryParam("login"))
  // settings, ok := oauthSettings[provider]
  // if !ok {
  // 	return errors.New("Invalid provider")
  // }
  // redirectURL, err := buildRedirect(provider, login, settings)
  // if err != nil {
  // 	return err
  // }
  // return c.Redirect(http.StatusFound, redirectURL)
}

function authDoneHandler(c: any) {
  // code := c.QueryParam("code")
  // state := c.QueryParam("state")
  // claims, err := token.Verify(state)
  // if err != nil {
  // 	return err
  // }
  // settings, ok := oauthSettings[claims.Provider]
  // if !ok {
  // 	return errors.New("Invalid provider")
  // }
  // form := url.Values{}
  // form.Set("client_id", settings.clientID)
  // form.Set("client_secret", settings.clientSecret)
  // form.Set("grant_type", "authorization_code")
  // form.Set("redirect_uri", settings.redirectURI)
  // form.Set("state", state)
  // form.Set("code", code)
  // client := &http.Client{}
  // req, err := http.NewRequest("POST", settings.tokenURL, bytes.NewBufferString(form.Encode()))
  // req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
  // req.Header.Set("Accept", "application/json")
  // if err != nil {
  // 	return err
  // }
  // res, err := client.Do(req)
  // if err != nil {
  // 	return err
  // }
  // defer res.Body.Close()
  // data, _ := ioutil.ReadAll(res.Body)
  // fmt.Println(string(data))
  // authToken := AuthToken{}
  // err = json.Unmarshal(data, &authToken)
  // if err != nil {
  // 	return err
  // }
  // if claims.Login {
  // 	sess, err := session.Get("as-z3zs10n", c)
  // 	if err != nil {
  // 		return err
  // 	}
  // 	sess.Options = &sessions.Options{
  // 		Path:     "/",
  // 		MaxAge:   3600, // 1 hour.
  // 		HttpOnly: true,
  // 		Secure:   os.Getenv("PRODUCTION") == "true",
  // 		SameSite: http.SameSiteStrictMode,
  // 	}
  // 	sess.Values["expiration"] = authToken.Expiration
  // 	sess.Values["access_token"] = authToken.AccessToken
  // 	err = sess.Save(c.Request(), c.Response())
  // 	if err != nil {
  // 		return err
  // 	}
  // 	sess2, err := session.Get("as-rs3rf3r", c)
  // 	if err != nil {
  // 		return err
  // 	}
  // 	sess2.Options = &sessions.Options{
  // 		Path:     "/",
  // 		MaxAge:   86400 * 7, // 7 days.
  // 		HttpOnly: true,
  // 		Secure:   os.Getenv("PRODUCTION") == "true",
  // 		SameSite: http.SameSiteStrictMode,
  // 	}
  // 	sess2.Values["refresh_token"] = authToken.RefreshToken
  // 	err = sess2.Save(c.Request(), c.Response())
  // 	if err != nil {
  // 		return err
  // 	}
  // 	return c.Redirect(http.StatusFound, "/")
  // }
  // responseData := &Response{
  // 	Token:    authToken.AccessToken,
  // 	Provider: claims.Provider,
  // }
  // responseJSON, err := json.Marshal(responseData)
  // if err != nil {
  // 	return err
  // }
  // return c.Render(http.StatusOK, "authorized.html", string(responseJSON))
}
