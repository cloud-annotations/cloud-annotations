/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import COSProvider from "./COSProvider";

export function activate(iris: any) {
  iris.providers.register({
    id: "cos",
    provider: new COSProvider(),
  });
}
