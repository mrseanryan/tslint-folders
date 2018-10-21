import { Casing } from "../model/FilenamesRuleConfig";
import { DocFormat } from "../tools/docsGenerator/Config";

export namespace EnumUtils {
  export function parseDocFormat(formatString: string): DocFormat {
    return (<any>DocFormat)[formatString];
  }

  export function parseCasing(casingString: string): Casing {
    return casingString as Casing;
  }
}
