import { DocConfig } from "../../../Config";
import { IDocOutputter } from "../../../interfaces/IDocOutputter";

export class DotStyleGenerator {
  constructor(
    protected config: DocConfig,
    protected outputter: IDocOutputter
  ) {}

  outputStyling() {
    this.outputGraphStyle();
    this.outputDefaultNodeStyling();
  }

  outputStylingForExternalNode() {
    this.outputter.outputLine("node [style=dashed]");
  }

  outputSubFolderStyle() {
    this.outputPlaceLabelsAtTop();

    this.outputter.outputLine(`node [shape="folder"]`);
  }

  outputPlaceLabelsAtTop() {
    this.outputter.outputLine("labelloc = b");
    this.outputter.outputLine("");
  }

  outputTopLevelSubGraphStyle() {
    this.outputter.outputLine(`node [shape="ellipse"]`);
  }

  private outputGraphStyle() {
    this.outputter.outputLine(`graph [`);
    this.outputter.increaseIndent();
    this.outputter.outputLines([`bgcolor="#FFFFFF"`, `fillcolor="#FFFFFF"`]);
    this.outputter.decreaseIndent();
    this.outputter.outputLine(`]`);
  }

  private outputDefaultNodeStyling() {
    // ref: working_copy.dot

    this.outputter.outputLine("node [");
    this.outputter.increaseIndent();

    // ref: colorscheme = https://graphviz.gitlab.io/_pages/doc/info/colors.html

    this.outputter.outputLines([
      `labeljust="l"`,
      `colorscheme="${this.config.dot.colorScheme}"`,
      `style=filled`,
      `fillcolor=3`,
      `shape=record`
    ]);

    this.outputter.decreaseIndent();

    this.outputter.outputLines([
      `]`,
      ``,
      `edge [arrowhead=vee, style=dashed, color="black"]`
    ]);
  }
}
