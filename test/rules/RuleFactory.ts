import * as Lint from "tslint";

import { RuleId } from "../../src/RuleId";
import * as Rules from "../../src/tslint-folders";

export namespace RuleFactory {
    export function createRuleForTestDirectoryPath(
        testDirectoryPath: string,
        tsLintConfig: any
    ): Lint.Rules.AbstractRule {
        const ruleId = getRuleIdForTestDirectoryPath(testDirectoryPath);

        const optionsForRule = getOptionsForRule(ruleId, tsLintConfig);

        return createRuleFromId(ruleId, optionsForRule);
    }

    function getRuleIdForTestDirectoryPath(testDirectoryPath: string): RuleId {
        const parts = testDirectoryPath.split("/");

        for (const part of parts) {
            const possibleRuleId = getRuleIdFromText(part);

            if (possibleRuleId !== undefined) {
                return possibleRuleId;
            }
        }

        throw new Error(`Cannot determine RuleId from test directory path '${testDirectoryPath}'`);
    }

    function getRuleIdFromText(text: string): RuleId | undefined {
        switch (text) {
            case RuleId.TsfFoldersDisabledTest as string:
                return RuleId.TsfFoldersDisabledTest;
            case RuleId.TsfFoldersFileNames as string:
                return RuleId.TsfFoldersFileNames;
            case RuleId.TsfFoldersImportFromDisallowedFolders:
                return RuleId.TsfFoldersImportFromDisallowedFolders;
            case RuleId.TsfFoldersImportsBetweenPackages:
                return RuleId.TsfFoldersImportsBetweenPackages;
            case RuleId.TsfFoldersTestWithBreakpoint:
                return RuleId.TsfFoldersTestWithBreakpoint;
            default:
                return undefined;
        }
    }

    function getOptionsForRule(ruleId: RuleId, tslintConfig: any): Lint.IOptions {
        const ruleArgs = tslintConfig.rules[ruleId];

        // Drop the first arg - this is what tslint does normally
        const arg = ruleArgs[1];
        // Default to empty args - important for rules that need to support old configs that had no args:
        const ruleArgsTrimmed = arg ? [arg] : [];

        return {
            disabledIntervals: [],
            ruleArguments: ruleArgsTrimmed,
            ruleName: ruleId,
            ruleSeverity: "error"
        };
    }

    function createRuleFromId(id: RuleId, options: Lint.IOptions): Lint.Rules.AbstractRule {
        switch (id) {
            case RuleId.TsfFoldersDisabledTest:
                return new Rules.TtsfFoldersDisabledTestRule.Rule(options);
            case RuleId.TsfFoldersFileNames:
                return new Rules.TsfFoldersFileNamesRule.Rule(options);
            case RuleId.TsfFoldersImportFromDisallowedFolders:
                return new Rules.TsfFoldersImportFromDisallowedFoldersRule.Rule(options);
            case RuleId.TsfFoldersImportsBetweenPackages:
                return new Rules.TsfFoldersImportsBetweenPackagesRule.Rule(options);
            case RuleId.TsfFoldersTestWithBreakpoint:
                return new Rules.TsfFoldersTestWithBreakpointRule.Rule(options);
            default:
                throw new Error(`Unhandled RuleId ${id}`);
        }
    }
}
