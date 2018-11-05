export type TestBreakpointRuleConfig = {
  debugTokens: string[];
  includePaths: string[];
};

export function getDefaultBreakpointRuleConfig(): TestBreakpointRuleConfig {
  return {
    debugTokens: ["browser.debug"],
    includePaths: [".spec.ts", ".spec.tsx", ".ispec.ts", ".ispec.tsx"]
  };
}
