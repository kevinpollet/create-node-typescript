/**
 * Copyright © 2019 kevinpollet <pollet.kevin@gmail.com>`
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE.md file.
 */

import childProcess from "child_process";

export const spawn = (
  command: string,
  args: string[],
  options: childProcess.SpawnOptions = { stdio: "inherit" }
) =>
  new Promise((resolve, reject) => {
    childProcess
      .spawn(command, args, options)
      .on("close", code => (code === 0 ? resolve() : reject()));
  });
