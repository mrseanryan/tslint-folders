export enum DocFormat {
  Text = "Text",
  Dot = "Dot"
}

export type DocConfig = {
  format: DocFormat;
  pathToTslintJson: string;
  skipSubFolders: boolean;
  dot: DotDocConfig;
};

export type DotDocConfig = {
  colorScheme: string;
  title: string;
  subTitle: string;
  maxColors: number;
};
