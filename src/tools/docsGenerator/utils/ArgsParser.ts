import { EnumUtils } from "../../../utils/EnumUtils";
import { DocConfig } from "../Config";

const NUM_MANDATORY_ARGS = 4;

export namespace ArgsParser {
  export function getConfigFromArgs(): DocConfig | null {
    if (process.argv.length < NUM_MANDATORY_ARGS) {
      return null;
    }

    try {
      const formatString = process.argv[3];
      const format = EnumUtils.parseDocFormat(formatString);

      const config: DocConfig = {
        pathToTslintJson: process.argv[2],
        format: format,
        colorScheme: "pastel19",
        // TODO xxx move down to dot: DotConfig
        // TODO xxx parse
        // TODO xxx provide (current) defaults
        skipSubFolders: false,
        subTitle: "Top-level Packages",
        title: "Project Packages",
        maxColors: 9 // should match the colorScheme
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
        // xxx -title=xxx
        // xxx -colorScheme=pastel19 -maxColors=9
        default:
          throw new Error(`unrecognised option ${optionArg}`);
      }
    }
  }
}
