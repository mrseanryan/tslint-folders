export namespace DirUtils {
    export function splitPath(filePath: string): string[] {
        return cleanPath(filePath).split("/");
    }

    function removeQuotesAndTicksFrom(filePath: string): string {
        return filePath.replace(/['"]+/g, "");
    }

    function replaceRepeatedBackslashesIn(filePath: string): string {
        return filePath.replace(/[\\]+/g, "\\");
    }

    export function cleanPath(filePath: string): string {
        let cleaned = filePath.trim();

        cleaned = removeQuotesAndTicksFrom(cleaned);
        cleaned = replaceRepeatedBackslashesIn(cleaned);

        return cleaned;
    }

    export function convertWindowsToUnix(filePath: string): string {
        return filePath.split("\\").join("/");
    }
}
