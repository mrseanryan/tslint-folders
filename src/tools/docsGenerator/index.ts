import * as fs from "fs";

import { ConfigFactory } from "../../config/ConfigFactory";
import { ImportsBetweenPackagesRuleConfig } from "../../model/ImportsBetweenPackagesRuleConfig";
import { EnumUtils } from "../../utils/EnumUtils";
import { DocConfig, DocFormat } from "./Config";
import { ErrorHandler, ErrorLevel } from "./ErrorHandler";
import { DocGeneratorFactory } from "./generators/DocGeneratorFactory";
import { ConsoleOutputter } from "./outputters/ConsoleOutputter";

const NEW_LINE = "\n";
const NUM_MANDATORY_ARGS = 4;

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

function showUsage() {
  handleError(
    `USAGE: index.ts <path to tslint.json> <format> [options]${NEW_LINE}` +
      `  where format is one of: ${getFormats()}${NEW_LINE}` +
      `  where options can be:${NEW_LINE}` +
      `    -skipSubFolders`,
    ErrorLevel.Fatal
  );
}

function main() {
  if (process.argv.length < NUM_MANDATORY_ARGS) {
    showUsage();
    return;
  }

  const config = getConfigFromArgs();
  if (!config) {
    showUsage();
    return;
  }

  const generator = DocGeneratorFactory.create(config.format);

  const outputter = new ConsoleOutputter();

  loadTslintConfig(config).then(packageConfig => {
    generator.generateDoc(config, packageConfig, outputter);
  });
}

function getConfigFromArgs(): DocConfig | null {
  try {
    const formatString = process.argv[3];
    const format = EnumUtils.parseDocFormat(formatString);

    const config: DocConfig = {
      pathToTslintJson: process.argv[2],
      format: format,
      skipSubFolders: false
    };

    updateConfigFromOptionalArgs(config);

    return config;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function updateConfigFromOptionalArgs(config: DocConfig) {
  for (let i = NUM_MANDATORY_ARGS; i < process.argv.length; i++) {
    const optionArg = process.argv[i];

    switch (optionArg) {
      case "-skipSubFolders":
        config.skipSubFolders = true;
        break;
      default:
        throw new Error(`unrecognised option ${optionArg}`);
    }
  }
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
          json.rules["tsf-folders-imports-between-packages"][1];

        const packageConfig = ConfigFactory.createForBetweenPackages([
          packageConfigJson
        ]);

        resolve(packageConfig);
      }
    });
  });
}

main();
