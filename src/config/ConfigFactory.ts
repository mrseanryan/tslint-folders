import { HardCodedConfigSource } from "./hardCoded/HardCodedConfigSource";
import { IConfig } from "./IConfig";

export namespace ConfigFactory {
    export function create(): IConfig {
        return new HardCodedConfigSource().getConfig();
    }
}
