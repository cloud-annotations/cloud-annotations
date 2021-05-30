/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { URLSearchParams } from "url";

import axios from "axios";
import express from "express";
import jwt from "jsonwebtoken";

if (
  process.env.IBM_LOGIN_CLIENT_ID === undefined ||
  process.env.IBM_LOGIN_CLIENT_SECRET === undefined ||
  process.env.IBM_REDIRECT_URI === undefined ||
  process.env.JWT_SECRET === undefined
) {
  throw new Error("Missing env vars");
}

const OAUTH_SETTINGS = {
  authURL: "https://iam.cloud.ibm.com/identity/authorize",
  tokenURL: "https://iam.cloud.ibm.com/identity/token",
  clientID: process.env.IBM_LOGIN_CLIENT_ID,
  clientSecret: process.env.IBM_LOGIN_CLIENT_SECRET,
  redirectURI: process.env.IBM_REDIRECT_URI,
};

const SECRET = process.env.JWT_SECRET;

export function authenticate(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  // res.sendStatus(401);

  console.log("session middleware");

  console.log(req.headers.cookie);
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

export function authHandler(_req: express.Request, res: express.Response) {
  const { authURL, clientID, redirectURI } = OAUTH_SETTINGS;

  const state = jwt.sign({}, SECRET, { expiresIn: "3m" });

  const query = new URLSearchParams();
  query.append("client_id", clientID);
  query.append("redirect_uri", redirectURI);
  query.append("state", state);

  const redirectURL = `${authURL}?${query.toString()}`;

  return res.redirect(302, redirectURL);
}

export async function authDoneHandler(
  req: express.Request,
  res: express.Response
) {
  const { code, state } = req.query;
  const { clientID, clientSecret, tokenURL, redirectURI } = OAUTH_SETTINGS;

  if (typeof state !== "string" || typeof code !== "string") {
    throw new Error("Missing query param");
  }

  jwt.verify(state, SECRET);

  const form = new URLSearchParams();
  form.append("client_id", clientID);
  form.append("client_secret", clientSecret);
  form.append("grant_type", "authorization_code");
  form.append("redirect_uri", redirectURI);
  form.append("state", state);
  form.append("code", code);

  const { data } = await axios.post(tokenURL, form, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
  });

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;

  const defaultCookieSettings: express.CookieOptions = {
    path: "/",
    httpOnly: true,
    secure: true, // NOTE: This might not work for localhost on all browsers
    sameSite: "strict",
  };

  res.cookie("access_token", data.access_token, {
    maxAge: hour,
    ...defaultCookieSettings,
  });

  res.cookie("refresh_token", data.refresh_token, {
    maxAge: month,
    ...defaultCookieSettings,
  });

  return res.redirect(302, "/");
}
