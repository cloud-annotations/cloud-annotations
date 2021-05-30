/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Router } from "express";

import {
  authHandler,
  authDoneHandler,
} from "../plugins/iris-server-plugin-ibm-auth";

const router = Router();

router.get("/", authHandler);

// TODO: I need to register /done with IBM Cloud
router.get("/done", authDoneHandler);
router.get("/callback", authDoneHandler);

export default router;
