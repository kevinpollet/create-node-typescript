/**
 * Copyright © 2019 kevinpollet <pollet.kevin@gmail.com>`
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE.md file.
 */

import chalk from "chalk";

export const info = (msg: string): boolean =>
  process.stdout.write(chalk`\n{blue ${msg}}\n`);

export const error = (msg: string | Error): boolean =>
  process.stdout.write(
    chalk`\n{red ${typeof msg === "string" ? msg : msg.stack!}}\n` // eslint-disable-line @typescript-eslint/no-non-null-assertion
  );
