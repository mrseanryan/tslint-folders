export namespace DirUtils {
    export function splitPath(filePath: string): string[] {
        return cleanPath(filePath).split("/");
    }

    export function cleanPath(filePath: string): string {
        let cleaned = filePath.trim();

        cleaned = cleaned.replace(/['"]+/g, "");
        cleaned = cleaned.replace(/[\\]+/g, "\\");

        return cleaned;
    }
}
