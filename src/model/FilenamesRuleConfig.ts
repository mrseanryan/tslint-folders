export enum Casing {
  CamelCase = "camel-case",
  PascalCase = "pascal-case",
  KebabCase = "kebab-case",
  SnakeCase = "snake-case"
}

export type FilenamesRuleConfig = {
  ignorePaths: string[];
  casings: Casing[];
};
