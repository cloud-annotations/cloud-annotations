/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { EndpointOptions, PathParams, QueryParams } from "./types";
import { stripEmptyKeys } from "./utils";

function injectPathParams(route: string, path?: PathParams) {
  return route.replace(/\/:(\w+)/gi, (_match, group1) => `/${path?.[group1]}`);
}

function queryString(query?: QueryParams) {
  if (query !== undefined) {
    const safe = stripEmptyKeys(query);
    return "?" + new URLSearchParams(safe).toString();
  }
  return "";
}

function endpoint(route: string, options: EndpointOptions = {}) {
  const { baseUrl = "/api/v2", path, query } = options;

  return baseUrl + injectPathParams(route, path) + queryString(query);
}

export default endpoint;
