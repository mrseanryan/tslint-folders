export type DisabledTestRuleConfig = {
  ban: string[];
  includePaths: string[];
};

export function getDefaultDisabledTestRuleConfig(): DisabledTestRuleConfig {
  return {
    ban: ["describe.only", "it.only", "describe.skip", "it.skip"],
    includePaths: [".spec.ts", ".spec.tsx", ".ispec.ts", ".ispec.tsx"]
  };
}
