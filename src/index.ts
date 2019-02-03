/**
 * Copyright (c) 2018 kevinpollet <pollet.kevin@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import program from "commander";
import dashify from "dashify";
import inquirer, { Answers } from "inquirer";
import { basename, join } from "path";
import validatePackageName from "validate-npm-package-name";
import { error, info } from "./messages";
import { renderTemplates } from "./renderTemplates";
import { spawn } from "./spawn";

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
    when: !program.name,
  },
  {
    default: "A Node.js module written in TypeScript",
    message: "Description:",
    name: "description",
    type: "input",
    when: !program.description,
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
  .then(answers => ({ ...answers, ...program }))
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
