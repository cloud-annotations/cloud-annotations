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

const OAUTH_SETTINGS = {
  authURL: "https://iam.cloud.ibm.com/identity/authorize",
  tokenURL: "https://iam.cloud.ibm.com/identity/token",
  clientID: process.env.IBM_LOGIN_CLIENT_ID,
  clientSecret: process.env.IBM_LOGIN_CLIENT_SECRET,
  redirectURI: process.env.IBM_REDIRECT_URI,
};

const SECRET = process.env.JWT_SECRET ?? "secret";

function setCookies(
  res: express.Response,
  {
    access_token,
    refresh_token,
  }: { access_token: string; refresh_token: string }
) {
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

  res.cookie("access_token", access_token, {
    maxAge: hour,
    ...defaultCookieSettings,
  });

  res.cookie("refresh_token", refresh_token, {
    maxAge: month,
    ...defaultCookieSettings,
  });
}

export async function authenticate(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  // authorized
  if (typeof req.cookies.access_token === "string") {
    return next();
  }

  // refreshable
  if (typeof req.cookies.refresh_token === "string") {
    const { tokenURL, clientID, clientSecret } = OAUTH_SETTINGS;

    const form = new URLSearchParams();
    if (clientID !== undefined) {
      form.append("client_id", clientID);
    }
    if (clientSecret !== undefined) {
      form.append("client_secret", clientSecret);
    }
    form.append("grant_type", "refresh_token");
    form.append("refresh_token", req.cookies.refresh_token);

    const { data } = await axios.post(tokenURL, form, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
    });

    setCookies(res, data);

    return next();
  }

  // unauthorized
  return res.sendStatus(401);
}

export function supportedGrantTypeHandler(
  _req: express.Request,
  res: express.Response
) {
  const { authURL, clientID, redirectURI } = OAUTH_SETTINGS;

  let payload = { grant_types: ["passcode"] };
  if (
    authURL !== undefined &&
    clientID !== undefined &&
    redirectURI !== undefined
  ) {
    payload.grant_types.push("authorization_code");
  }

  return res.send(payload);
}

export function authHandler(_req: express.Request, res: express.Response) {
  const { authURL, clientID, redirectURI } = OAUTH_SETTINGS;

  if (clientID === undefined || redirectURI === undefined) {
    throw new Error("Missing env vars");
  }

  const state = jwt.sign({}, SECRET, { expiresIn: "3m" });

  const query = new URLSearchParams();
  query.append("client_id", clientID);
  query.append("redirect_uri", redirectURI);
  query.append("state", state);

  const redirectURL = `${authURL}?${query.toString()}`;

  return res.redirect(302, redirectURL);
}

export async function authCallbackHandler(
  req: express.Request,
  res: express.Response
) {
  const { code, state } = req.query;
  const { clientID, clientSecret, tokenURL, redirectURI } = OAUTH_SETTINGS;

  if (
    clientID === undefined ||
    redirectURI === undefined ||
    clientSecret === undefined
  ) {
    throw new Error("Missing env vars");
  }

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

  setCookies(res, data);

  return res.redirect(302, "/");
}
