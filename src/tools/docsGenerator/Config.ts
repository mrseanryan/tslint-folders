export enum DocFormat {
  Text = "Text"
  // TODO Dot
  // TODO DotStyled
}

export type DocConfig = {
  format: DocFormat;
  pathToTslintJson: string;
  skipSubFolders: boolean;
};
