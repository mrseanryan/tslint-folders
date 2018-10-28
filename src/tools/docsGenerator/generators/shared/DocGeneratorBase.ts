import { DocConfig } from "../../Config";
import { IDocOutputter } from "../../interfaces/IDocOutputter";

export abstract class DocGeneratorBase {
  constructor(
    protected config: DocConfig,
    protected outputter: IDocOutputter
  ) {}
}
