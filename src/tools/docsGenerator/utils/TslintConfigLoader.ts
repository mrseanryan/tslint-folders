import * as fs from "fs";

import { ConfigFactory } from "../../../config/ConfigFactory";
import { ImportsBetweenPackagesRuleConfig } from "../../../model/ImportsBetweenPackagesRuleConfig";
import { DocConfig } from "../Config";

export namespace TslintConfigLoader {
  export function loadTslintConfig(
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
}
