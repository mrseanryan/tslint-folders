import { IConfig } from "./IConfig";

// Abstracts out the source of the config.
// The source could be hard-coded, or else reading from tslint.json
export interface IConfigSource {
    getConfig(): IConfig;
}
