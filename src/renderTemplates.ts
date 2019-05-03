/**
 * Copyright © 2019 kevinpollet <pollet.kevin@gmail.com>`
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE.md file.
 */

import { outputFile, readdir, readFile, stat } from "fs-extra";
import { compile } from "handlebars";
import { join } from "path";

export const renderTemplates = (
  dirPath: string,
  destinationDirPath: string,
  context: object,
  rootDir: string = dirPath // TODO: remove/simplify
): Promise<void> =>
  stat(dirPath).then(stats => {
    if (!stats.isDirectory()) {
      const relativePath = dirPath.replace(rootDir, "").replace(".hbs", "");

      return readFile(dirPath).then(buffer =>
        outputFile(
          join(destinationDirPath, relativePath),
          compile(buffer.toString())(context) // TODO render only files ending with hbs
        )
      );
    }

    return readdir(dirPath)
      .then(files =>
        Promise.all(
          files.map(file =>
            renderTemplates(
              join(dirPath, file),
              destinationDirPath,
              context,
              rootDir
            )
          )
        )
      )
      .then(() => {
        // TODO: must be removed
        return;
      });
  });
