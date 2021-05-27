/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Request, Response } from "express";

function notFoundHandler(_req: Request, res: Response) {
  res.sendStatus(404);
}

export default notFoundHandler;
