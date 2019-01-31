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
      const relativePath = dirPath.replace(rootDir, "");

      return readFile(dirPath).then(buffer =>
        outputFile(
          join(destinationDirPath, relativePath),
          compile(buffer.toString())(context)
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
