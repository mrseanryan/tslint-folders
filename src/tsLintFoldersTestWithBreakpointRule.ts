import * as Lint from "tslint";
import * as ts from "typescript";

import { GeneralRuleUtils } from "./utils/GeneralRuleUtils";

const RULE_ID = "tslint-folders-test-with-breakpoint";

export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        if (!GeneralRuleUtils.isInTestFile(sourceFile.fileName)) {
            return [];
        }

        const walker = new StatementsWalker(sourceFile, this.getOptions());
        this.applyWithWalker(walker);

        return walker.getFailures();
    }
}

class StatementsWalker extends Lint.RuleWalker {
    visitCallExpression(node: ts.CallExpression) {
        const text = node.getText();

        if (text.startsWith("browser.debug")) {
            this.addFailureAtNode(
                node.getFirstToken(),
                GeneralRuleUtils.buildFailureString("do not hard code breakpoints in the test", RULE_ID)
            );
        }

        super.visitCallExpression(node);
    }
}
