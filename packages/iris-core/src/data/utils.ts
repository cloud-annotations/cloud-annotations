/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Project } from "./types";

export function labelNameExists(
  labels: { [key: string]: Project.Label },
  label: string
) {
  const names = Object.values(labels).map((l) => l.name);
  return names.includes(label);
}
