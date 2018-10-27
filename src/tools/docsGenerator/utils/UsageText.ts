import { DocFormat } from "../Config";

export namespace UsageText {
  const NEW_LINE = "\n";

  function getFormats(): string {
    let texts: string[] = [];

    for (let item in DocFormat) {
      if (isNaN(Number(item))) {
        texts.push(item);
      }
    }

    return texts.join(", ");
  }

  export function showUsage() {
    console.error(
      `USAGE: index.ts <path to tslint.json> <format> [options]${NEW_LINE}` +
        `  where format is one of: ${getFormats()}${NEW_LINE}` +
        `  where options can be:${NEW_LINE}` +
        `    -skipSubFolders`
    );
  }
}
