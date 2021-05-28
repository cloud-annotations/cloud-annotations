/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { labelNameExists } from "./utils";

describe("labelNameExists", () => {
  it("returns true for existing names", () => {
    expect(
      labelNameExists(
        { "1": { id: "1", name: "x" }, "2": { id: "2", name: "y" } },
        "x"
      )
    ).toBe(true);
  });

  it("returns false for nonexistant names", () => {
    expect(
      labelNameExists(
        { y: { id: "y", name: "y" }, x: { id: "x", name: "xxx" } },
        "x"
      )
    ).toBe(false);
  });
});
