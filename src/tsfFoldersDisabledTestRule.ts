import * as Lint from "tslint";
import * as ts from "typescript";

import { ConfigFactory } from "./config/ConfigFactory";
import { DisabledTestRuleConfig } from "./model/DisabledTestRuleConfig";
import { GeneralRuleUtils } from "./utils/GeneralRuleUtils";

export const DISABLED_TEST_RULE_ID = "tsf-folders-disabled-test";

export class TsfDisabledTestRule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        const config = ConfigFactory.createForDisabledTestRule(this.getOptions());

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
        private config: DisabledTestRuleConfig
    ) {
        super(sourceFile, options);
    }

    visitCallExpression(node: ts.CallExpression) {
        const text = node.getText();

        if (this.config.ban.some(token => text.startsWith(token))) {
            this.addFailureAtNode(
                node.getFirstToken(),
                GeneralRuleUtils.buildFailureString(
                    "do not disable or enable only some tests",
                    DISABLED_TEST_RULE_ID
                )
            );
        }

        super.visitCallExpression(node);
    }
}
