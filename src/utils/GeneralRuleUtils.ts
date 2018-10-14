export namespace GeneralRuleUtils {
  export function buildFailureString(message: string, ruleId: string): string {
    // include the rule ID, to make it easier to disable
    return `${message} (${ruleId})`;
  }

  // TODO xxx remove - replace with config
  export function isInTestFile(filePath: string): boolean {
    const testExtensions = [".spec.ts", ".spec.tsx", ".ispec.ts", ".ispec.tsx"];

    return testExtensions.some(extension => filePath.endsWith(extension));
  }
}
