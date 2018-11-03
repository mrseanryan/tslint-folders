import { DocConfig } from "../../Config";
import { IDocOutputter } from "../../interfaces/IDocOutputter";
import { BlacklistFilter } from "../../utils/BlacklistFilter";

export abstract class DocGeneratorBase {
  protected filter: BlacklistFilter;

  constructor(protected config: DocConfig, protected outputter: IDocOutputter) {
    this.filter = new BlacklistFilter(this.config);
  }
}
