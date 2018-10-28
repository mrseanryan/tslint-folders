import { DocGeneratorFactory } from "./generators/DocGeneratorFactory";
import { ConsoleOutputter } from "./outputters/ConsoleOutputter";
import { ArgsParser } from "./utils/ArgsParser";
import { TslintConfigLoader } from "./utils/TslintConfigLoader";
import { UsageText } from "./utils/UsageText";

function main() {
  const config = ArgsParser.getConfigFromArgs();
  if (!config) {
    UsageText.showUsage();
    return;
  }

  const outputter = new ConsoleOutputter();

  const generator = DocGeneratorFactory.create(config, outputter);

  TslintConfigLoader.loadTslintConfig(config).then(packageConfig => {
    generator.generateDoc(packageConfig);
  });
}

main();
