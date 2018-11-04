export enum DocFormat {
  Text = "Text",
  Dot = "Dot"
}

export type DocConfig = {
  format: DocFormat;
  importBlacklist: string;
  importWhitelist: string;
  outpath: string;
  pathToTslintJson: string;
  skipSubFolders: boolean;
  dot: DotDocConfig;
};

export type DotDocConfig = {
  clusterFromTslintJson: boolean;
  colorScheme: string;
  isGraphOptimizerEnabled: boolean;
  maxColors: number;
  packageShape: string;
  showImportAnyAsNodeNotEdges: boolean;
  subFolderShape: string;
  subTitle: string;
  title: string;
};
