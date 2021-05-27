/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export function stripEmptyKeys<T>(o: { [key: string]: T | undefined }) {
  let safe: { [key: string]: T } = {};
  for (const [key, val] of Object.entries(o)) {
    if (val !== undefined && val !== null) {
      safe[key] = val;
    }
  }
  return safe;
}
