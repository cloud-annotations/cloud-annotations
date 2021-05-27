#!/usr/bin/env node

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
