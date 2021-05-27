/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import endpoint from "./endpoint";
import { APIOptions, HttpError, MethodOptions } from "./types";
import { stripEmptyKeys } from "./utils";

export async function fetcher(endpoint: RequestInfo, options?: RequestInit) {
  const res = await fetch(endpoint, options);

  if (!res.ok) {
    const error = new Error(res.statusText) as HttpError;
    error.status = res.status;
    throw error;
  }

  // swallow json parse errors
  // TODO: handle this better, what about `res.blob()` etc...
  try {
    return await res.json();
  } catch {}
}

export async function request(route: string, options: APIOptions) {
  const { body, json, headers, method, signal, ...rest } = options;

  const url = endpoint(route, rest);

  return await fetcher(url, {
    signal,
    method,
    headers: headers ? stripEmptyKeys(headers) : undefined,
    body: json ? JSON.stringify(json) : body,
  });
}

async function get(route: string, options: MethodOptions = {}) {
  return await request(route, { ...options, method: "GET" });
}

async function post(route: string, options: MethodOptions = {}) {
  return await request(route, { ...options, method: "POST" });
}

async function put(route: string, options: MethodOptions = {}) {
  return await request(route, { ...options, method: "PUT" });
}

async function del(route: string, options: MethodOptions = {}) {
  return await request(route, { ...options, method: "DELETE" });
}

const api = {
  get,
  post,
  put,
  del,
};

export default api;
