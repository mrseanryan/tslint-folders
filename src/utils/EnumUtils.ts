import { Casing } from "../model/FilenamesRuleConfig";

export namespace EnumUtils {
    export function parseCasing(casingString: string): Casing {
        return casingString as Casing;
    }
}
