export enum DocFormat {
  Text = "Text",
  Dot = "Dot"
}

export type DocConfig = {
  format: DocFormat;
  importBlacklist: string;
  pathToTslintJson: string;
  skipSubFolders: boolean;
  dot: DotDocConfig;
};

export type DotDocConfig = {
  colorScheme: string;
  maxColors: number;
  showImportAnyAsNodeNotEdges: boolean;
  subTitle: string;
  title: string;
};
