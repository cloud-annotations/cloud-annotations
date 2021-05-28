/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { Command } = require("commander");

const command = new Command()
  .command("ui")
  .description("TODO: description")
  .action(() => {
    console.log("...");
  });

module.exports = command;
