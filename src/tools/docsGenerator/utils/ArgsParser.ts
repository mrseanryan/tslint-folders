import { EnumUtils } from "../../../utils/EnumUtils";
import { DocConfig } from "../Config";
import { ConfigDefaults } from "../ConfigDefaults";

const NUM_MANDATORY_ARGS = 4;

export namespace ArgsParser {
  export function getConfigFromArgs(): DocConfig | null {
    if (process.argv.length < NUM_MANDATORY_ARGS) {
      return null;
    }

    try {
      const config: DocConfig = ConfigDefaults.getDefault();

      updateConfigFromArgs(config);

      updateConfigFromOptionalArgs(config);

      return config;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  function updateConfigFromArgs(config: DocConfig) {
    const formatString = process.argv[3];
    const format = EnumUtils.parseDocFormat(formatString);

    Object.assign(config, {
      pathToTslintJson: process.argv[2],
      format: format
    });
  }

  function updateConfigFromOptionalArgs(config: DocConfig) {
    for (let i = NUM_MANDATORY_ARGS; i < process.argv.length; i++) {
      const optionArg = process.argv[i];

      const optionParts = optionArg.split("=");
      const option = optionParts[0].trim();

      let value = optionParts.length > 1 ? optionParts[1].trim() : null;

      const assertHasValue = (message: string): string => {
        if (!value) {
          throw new Error(message);
        }
        return value;
      };

      const assertHasNumericValue = (message: string): number => {
        const textValue = assertHasValue(message);

        const numberValue = Number.parseInt(textValue, 10);

        if (!isFinite(numberValue)) {
          throw new Error(message);
        }

        return numberValue;
      };

      switch (option) {
        case "-clusterFromTslintJson":
          config.dot.clusterFromTslintJson = true;
          break;
        case "-colorScheme":
          value = assertHasValue(
            "color scheme must have a value, like: colorScheme=piyg11"
          );
          config.dot.colorScheme = value;
          break;
        case "-disableGraphOptimizer":
          config.dot.isGraphOptimizerEnabled = false;
          break;
        case "-importBlacklist":
          value = assertHasValue(
            "black list must have a value, like: importBlacklist=todo-area,contact-area"
          );
          config.importBlacklist = value;
          break;
        case "-maxColors":
          const maxColors = assertHasNumericValue(
            "max colors must have a value, like: maxColors=8"
          );
          config.dot.maxColors = maxColors;
          break;
        case "-outpath":
          value = assertHasValue(
            "outpath must have a value, like: outpath=/tmp/my-file.dot"
          );
          config.outpath = value;
          break;
        case "-showImportAnyAsNodeNotEdges":
          config.dot.showImportAnyAsNodeNotEdges = true;
          break;
        case "-skipSubFolders":
          config.skipSubFolders = true;
          break;
        case "-subTitle": {
          value = assertHasValue(
            "sub title must have a value, like: subTitle=MyTitle"
          );
          config.dot.subTitle = value;
          break;
        }
        case "-title": {
          value = assertHasValue(
            "title must have a value, like: title=MyTitle"
          );
          config.dot.title = value;
          break;
        }
        case "":
          break;
        default:
          throw new Error(`unrecognised option ${optionArg}`);
      }
    }
  }
}
