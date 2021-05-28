/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { NextFunction, Request, Response } from "express";

function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) {
    return next(err);
  }
  // Don't leak internal errors in production.
  if (process.env.NODE_ENV === "production") {
    return res.sendStatus(500);
  }

  return res.status(500).json({ error: err.message });
}

export default errorHandler;
