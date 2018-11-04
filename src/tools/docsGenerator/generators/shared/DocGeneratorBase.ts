import { DocConfig } from "../../Config";
import { IDocOutputter } from "../../interfaces/IDocOutputter";
import { PackageFilter } from "../../utils/PackageFilter";

export abstract class DocGeneratorBase {
  protected filter: PackageFilter;

  constructor(protected config: DocConfig, protected outputter: IDocOutputter) {
    this.filter = new PackageFilter(this.config);
  }
}
