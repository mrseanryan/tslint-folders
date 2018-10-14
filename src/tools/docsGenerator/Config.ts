export enum DocFormat {
  Text
  // TODO Markdown
  // TODO Dot
}

export type DocConfig = {
  pathToTslintJson: string;
  format: DocFormat;
};
