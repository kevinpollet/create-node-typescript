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

import { spawn } from "child_process";
import program from "commander";
import dashify from "dashify";
import inquirer from "inquirer";
import { basename, join } from "path";
import { error, info, success } from "./messages";
import { renderTemplates } from "./renderTemplates";

program.usage("[destination]").parse(process.argv);

const destinationDir = program.args.length
  ? join(process.cwd(), program.args.shift()!)
  : process.cwd();

const templatesDir = join(__dirname, "../templates");

const prompts = [
  {
    default: dashify(basename(destinationDir), { condense: true }),
    message: "Name:",
    name: "name",
    type: "input",
  },
  {
    default: "A Node.js module written in TypeScript",
    message: "Description:",
    name: "description",
    type: "input",
  },
  {
    default: "1.0.0",
    message: "Version:",
    name: "version",
    type: "input",
  },
];

inquirer
  .prompt(prompts)
  .then(answers => {
    info("Render project templates");

    return renderTemplates(templatesDir, destinationDir, answers);
  })
  .then(() => {
    info("Install project dependencies");

    return new Promise((resolve, reject) => {
      spawn("npm", ["--prefix", destinationDir, "install"], {
        stdio: "inherit",
      }).on("close", code =>
        code === 0
          ? resolve()
          : reject(new Error("Could not install npm dependencies"))
      );
    });
  })
  .then(() => {
    success("Enjoy");
    process.exit(0);
  })
  .catch((err: Error) => {
    error(err.stack || "Error");
    process.exit(1);
  });
