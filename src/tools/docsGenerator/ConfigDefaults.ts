import { DocConfig, DocFormat } from "./Config";

export namespace ConfigDefaults {
  export function getDefault(): DocConfig {
    return {
      dot: {
        clusterFromTslintJson: false,
        colorScheme: "pastel19",
        isGraphOptimizerEnabled: true,
        maxColors: 9,
        packageShape: "oval",
        showImportAnyAsNodeNotEdges: false,
        subFolderShape: "folder",
        subTitle: "Top-level Packages",
        title: "Project Packages"
      },
      format: DocFormat.Dot,
      importBlacklist: "",
      importWhitelist: "",
      outpath: "",
      pathToTslintJson: "",
      skipSubFolders: false
    };
  }
}
