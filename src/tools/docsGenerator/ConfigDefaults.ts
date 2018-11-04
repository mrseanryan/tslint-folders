import { DocConfig, DocFormat } from "./Config";

export namespace ConfigDefaults {
  export function getDefault(): DocConfig {
    return {
      dot: {
        clusterFromTslintJson: false,
        colorScheme: "pastel19",
        maxColors: 9,
        showImportAnyAsNodeNotEdges: false,
        subTitle: "Top-level Packages",
        title: "Project Packages"
      },
      format: DocFormat.Dot,
      importBlacklist: "",
      outpath: "",
      pathToTslintJson: "",
      skipSubFolders: false
    };
  }
}
