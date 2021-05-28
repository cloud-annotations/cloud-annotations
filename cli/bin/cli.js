/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { Command } = require("commander");

const build = require("./commands/build");
const server = require("./commands/server");
const start = require("./commands/start");
const ui = require("./commands/ui");

function cli() {
  const program = new Command();
  program.version("0.0.1");

  program.addCommand(start);
  program.addCommand(build);
  program.addCommand(ui);
  program.addCommand(server);

  program.parse(process.argv);
}

module.exports = cli;
