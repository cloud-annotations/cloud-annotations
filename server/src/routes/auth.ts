/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Router } from "express";

import {
  authHandler,
  authCallbackHandler,
  supportedGrantTypeHandler,
} from "../plugins/iris-server-plugin-ibm-auth";

const router = Router();

router.get("/", authHandler);

router.get("/grant-types", supportedGrantTypeHandler);

router.get("/callback", authCallbackHandler);

export default router;
