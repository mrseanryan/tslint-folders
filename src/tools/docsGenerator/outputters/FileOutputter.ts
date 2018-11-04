import * as fs from "fs";

import { OutputterBase } from "./OutputterBase";

const NEW_LINE = "\n";

export class FileOutputter extends OutputterBase {
  private firstWrite = true;

  constructor(private outpath: string) {
    super();
  }

  /**
   * Write to file as soon as possible (in case debugging)
   *
   * note: node 'fs.sync' is not really sync writing
   * ref: https://www.daveeddy.com/2013/03/26/synchronous-file-io-in-nodejs/
   * but it simplifies the API here
   */
  protected writeLine(text: string) {
    const line = text + NEW_LINE;

    if (fs.existsSync(this.outpath) && !this.firstWrite) {
      fs.appendFileSync(this.outpath, line);
    } else {
      fs.writeFileSync(this.outpath, line, "utf8");
    }

    this.firstWrite = false;
  }
}
