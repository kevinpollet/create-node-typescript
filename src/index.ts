/**
 * Copyright © 2019 kevinpollet <pollet.kevin@gmail.com>`
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE.md file.
 */

import program from "commander";
import dashify from "dashify";
import inquirer, { Answers } from "inquirer";
import { basename, join } from "path";
import validatePackageName from "validate-npm-package-name";
import { error, info } from "./messages";
import { renderTemplates } from "./renderTemplates";
import { spawn } from "./spawn";

// workaround for https://github.com/tj/commander.js/issues/648
program.optionValues = {};

program
  .usage("[options] [destination]")
  .option("--name <name>", "Define the package name")
  .option("--description <description>", "Define the package description")
  .option("--author <author>", "Define the package author")
  .option(
    "--packageManager <packageManager>",
    "Define the package manager to use",
    /^(npm|yarn)$/i
  )
  .on("option:name", value => {
    program.optionValues.name = value;
  })
  .on("option:description", value => {
    program.optionValues.description = value;
  })
  .parse(process.argv);

const destinationDir = program.args.length
  ? join(process.cwd(), program.args.shift()!)
  : process.cwd();

const templatesDir = join(__dirname, "../templates");

const questions = [
  {
    default: dashify(basename(destinationDir), { condense: true }),
    message: "Name:",
    name: "name",
    type: "input",
    validate: (input: string) => validatePackageName(input).validForNewPackages,
    when: !program.optionValues.name,
  },
  {
    default: "A Node.js module written in TypeScript",
    message: "Description:",
    name: "description",
    type: "input",
    when: !program.optionValues.description,
  },
  {
    message: "Author:",
    name: "author",
    type: "input",
    when: !program.author,
  },
  {
    choices: ["npm", "yarn"],
    message: "Package manager:",
    name: "packageManager",
    type: "list",
    when: !program.packageManager,
  },
];

inquirer
  .prompt<Answers>(questions)
  .then(answers => ({ ...answers, ...program, ...program.optionValues }))
  .then(answers => {
    info("Rendering project templates...");

    return renderTemplates(templatesDir, destinationDir, answers)
      .then(() => answers)
      .catch(() =>
        Promise.reject(new Error("Could not render project templates"))
      );
  })
  .then(answers => {
    info("Initializing Git repository...");

    return spawn("git", ["init", destinationDir])
      .then(() => answers)
      .catch(() =>
        Promise.reject(new Error("Could not initialize Git repository"))
      );
  })
  .then(answers => {
    info("Resolving project dependencies...");

    return spawn(answers.packageManager, [
      answers.packageManager === "npm" ? "--prefix" : "--cwd",
      destinationDir,
      "install",
    ])
      .then(() => answers)
      .catch(() =>
        Promise.reject(new Error("Could not install project dependencies"))
      );
  })
  .then(() => {
    info("Enjoy");
    process.exit(0);
  })
  .catch((err: Error) => {
    error(err);
    process.exit(1);
  });
