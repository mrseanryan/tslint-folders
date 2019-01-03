import * as Lint from "tslint";
import * as ts from "typescript";

import { ConfigFactory } from "./config/ConfigFactory";
import { TestBreakpointRuleConfig } from "./model/TestBreakpointRuleConfig";
import { GeneralRuleUtils } from "./utils/GeneralRuleUtils";

export const TEST_BREAKPOINT_RULE_ID = "tsf-folders-test-with-breakpoint";

export class TsfTestWithBreakPointRule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        const config = ConfigFactory.createForTestBreakpointRule(this.getOptions());

        if (!GeneralRuleUtils.isFileInPaths(sourceFile.fileName, config.includePaths)) {
            return [];
        }

        const walker = new StatementsWalker(sourceFile, this.getOptions(), config);
        this.applyWithWalker(walker);

        return walker.getFailures();
    }
}

class StatementsWalker extends Lint.RuleWalker {
    constructor(
        sourceFile: ts.SourceFile,
        options: Lint.IOptions,
        private config: TestBreakpointRuleConfig
    ) {
        super(sourceFile, options);
    }

    visitCallExpression(node: ts.CallExpression) {
        const text = node.getText();

        if (this.config.debugTokens.some(token => text.startsWith(token))) {
            this.addFailureAtNode(
                node.getFirstToken(),
                GeneralRuleUtils.buildFailureString(
                    "do not hard code breakpoints in the test",
                    TEST_BREAKPOINT_RULE_ID
                )
            );
        }

        super.visitCallExpression(node);
    }
}
