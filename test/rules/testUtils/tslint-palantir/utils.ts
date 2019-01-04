import * as fs from "fs";
import { getSourceFile } from "tslint";
import * as ts from "typescript";

export function getSourceFileFromPath(filepath: string): ts.SourceFile {
    const source = fs.readFileSync(filepath, "utf8");

    return getSourceFile(filepath, source);
}
