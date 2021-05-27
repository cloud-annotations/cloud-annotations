#!/usr/bin/env node
/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split(".");
const major = semver[0];

if (major < 10) {
  console.error(
    "You are running Node " +
      currentNodeVersion +
      ".\n" +
      "Iris requires Node 10 or higher. \n" +
      "Please update your version of Node."
  );
  process.exit(1);
}

const cli = require("./cli");

cli();
