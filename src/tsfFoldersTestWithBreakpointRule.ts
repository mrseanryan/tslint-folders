import * as Lint from "tslint";
import * as ts from "typescript";

import { ConfigFactory } from "./config/ConfigFactory";
import { TestBreakpointRuleConfig } from "./model/TestBreakpointRuleConfig";
import { RuleId } from "./RuleId";
import { GeneralRuleUtils } from "./utils/GeneralRuleUtils";

export class Rule extends Lint.Rules.AbstractRule {
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
                node.getFirstToken() || node,
                GeneralRuleUtils.buildFailureString(
                    "do not hard code breakpoints in the test",
                    RuleId.TsfFoldersTestWithBreakpoint
                )
            );
        }

        super.visitCallExpression(node);
    }
}
