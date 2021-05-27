/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import helmet from "helmet";

function security() {
  return helmet({ contentSecurityPolicy: false });
}

export default security;
