export enum DocFormat {
  Text = "Text",
  Dot = "Dot"
  // TODO DotStyled
}

export type DocConfig = {
  format: DocFormat;
  pathToTslintJson: string;
  skipSubFolders: boolean;
};
