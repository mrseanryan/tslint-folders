export enum DocFormat {
  Text = "Text",
  Dot = "Dot"
}

export type DocConfig = {
  format: DocFormat;
  importBlacklist: string;
  outpath: string;
  pathToTslintJson: string;
  skipSubFolders: boolean;
  dot: DotDocConfig;
};

export type DotDocConfig = {
  clusterFromTslintJson: boolean;
  colorScheme: string;
  maxColors: number;
  showImportAnyAsNodeNotEdges: boolean;
  subTitle: string;
  title: string;
};
