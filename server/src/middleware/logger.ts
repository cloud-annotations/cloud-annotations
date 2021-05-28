/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import pinoColada from "pino-colada";
import pino from "pino-http";

function logger() {
  return pino({
    level: process.env.LOG_LEVEL || "info",
    prettyPrint: process.env.NODE_ENV !== "production",
    prettifier: pinoColada,
  });
}

export default logger;
