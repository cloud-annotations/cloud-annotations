const { Command } = require("commander");

const command = new Command()
  .command("ui")
  .description("TODO: description")
  .action(() => {
    console.log("...");
  });

module.exports = command;
