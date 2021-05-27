/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from "path";

import express, { Router } from "express";

const root = process.env.SPA_ROOT;

const router = Router();

if (root) {
  router.use(express.static(root, { maxAge: 31536000 }));
  router.get("*", (_req, res) => {
    res.sendFile(path.join(root, "index.html"));
  });
}

export default router;
