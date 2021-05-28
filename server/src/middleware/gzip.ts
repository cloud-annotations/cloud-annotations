/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import compression from "compression";

function gzip() {
  return compression({
    filter: (req, res) => {
      // don't compress responses asking explicitly not
      if (req.headers["x-no-compression"]) {
        return false;
      }

      // use compression filter function
      return compression.filter(req, res);
    },
  });
}

export default gzip;
