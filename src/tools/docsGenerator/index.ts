import * as fs from "fs";

import { ConfigFactory } from "../../config/ConfigFactory";
import { ImportsBetweenPackagesRuleConfig } from "../../model/ImportsBetweenPackagesRuleConfig";
import { EnumUtils } from "../../utils/EnumUtils";
import { DocConfig, DocFormat } from "./Config";
import { ErrorHandler, ErrorLevel } from "./ErrorHandler";
import { DocGeneratorFactory } from "./generators/DocGeneratorFactory";
import { ConsoleOutputter } from "./outputters/ConsoleOutputter";

const handleError: ErrorHandler = (
  message: any,
  errorLevel: ErrorLevel = ErrorLevel.Fatal
) => {
  console.error(message);

  if (errorLevel === ErrorLevel.Fatal) {
    process.exit(1);
  }
};

function getFormats(): string {
  let texts: string[] = [];

  for (let item in DocFormat) {
    if (isNaN(Number(item))) {
      texts.push(item);
    }
  }

  return texts.join(", ");
}

function main() {
  console.log("package structure:");
  if (process.argv.length !== 4) {
    handleError(
      `USAGE: index.ts <path to tslint.json> <format>\n  where format is one of: ${getFormats()}`
    );
  }

  const formatString = process.argv[3];
  const format = EnumUtils.parseDocFormat(formatString);

  const config: DocConfig = {
    pathToTslintJson: process.argv[2],
    format: format
  };

  const generator = DocGeneratorFactory.create(format);

  const outputter = new ConsoleOutputter();

  loadTslintConfig(config).then(packageConfig => {
    generator.generateDoc(config, packageConfig, outputter);
  });
}

function loadTslintConfig(
  config: DocConfig
): Promise<ImportsBetweenPackagesRuleConfig> {
  return new Promise((resolve, reject) => {
    fs.readFile(config.pathToTslintJson, "utf8", function(err, data) {
      if (err) {
        reject(err);
      } else {
        const json = JSON.parse(data);

        const packageConfigJson =
          json.rules["tslint-folders-imports-between-packages"][1];

        const packageConfig = ConfigFactory.createForBetweenPackages([
          packageConfigJson
        ]);

        resolve(packageConfig);
      }
    });
  });
}

main();
