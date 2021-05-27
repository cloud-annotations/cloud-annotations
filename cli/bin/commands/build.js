const { Command } = require("commander");

const command = new Command()
  .command("build")
  .description("TODO: description")
  .action(() => {
    console.log("...");
  });

module.exports = command;
