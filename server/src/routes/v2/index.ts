/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Router } from "express";

import apiRouter from "./api";
import authRouter from "./auth";

const router = Router();

router.use("/auth", authRouter);
router.use("/", apiRouter);

export default router;
