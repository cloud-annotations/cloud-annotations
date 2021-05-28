/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import FileSystemProvider from "./FileSystemProvider";

export function activate(iris: any) {
  iris.providers.register({
    id: "file-system",
    provider: new FileSystemProvider(),
  });
}
