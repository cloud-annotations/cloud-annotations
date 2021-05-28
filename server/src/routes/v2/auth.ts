/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Router } from "express";

const router = Router();

router.get("/status", (_req, res) => {
  res.sendStatus(200);
});

export default router;
