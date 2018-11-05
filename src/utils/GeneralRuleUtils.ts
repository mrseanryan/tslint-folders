export namespace GeneralRuleUtils {
  export function buildFailureString(message: string, ruleId: string): string {
    // include the rule ID, to make it easier to disable
    return `${message} (${ruleId})`;
  }

  export function isFileInPaths(filePath: string, paths: string[]): boolean {
    return paths.some(path => filePath.indexOf(path) >= 0);
  }
}
