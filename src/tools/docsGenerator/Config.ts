export enum DocFormat {
  Text = "Text",
  Dot = "Dot"
}

export type DocConfig = {
  format: DocFormat;
  pathToTslintJson: string;
  skipSubFolders: boolean;
  colorScheme: string;
  title: string;
  subTitle: string;
  maxColors: number;
};
