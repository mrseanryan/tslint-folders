import * as Lint from "tslint";
import * as ts from "typescript";

import { GeneralRuleUtils } from "./utils/GeneralRuleUtils";

const RULE_ID = "tsf-folders-disabled-test";

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

        if (text.startsWith("describe.only") || text.startsWith("it.only")) {
            this.addFailureAtNode(
                node.getFirstToken(),
                GeneralRuleUtils.buildFailureString("do not enable only some tests", RULE_ID)
            );
        }

        if (text.startsWith("describe.skip") || text.startsWith("it.skip")) {
            this.addFailureAtNode(
                node.getFirstToken(),
                GeneralRuleUtils.buildFailureString("do not disable tests", RULE_ID)
            );
        }

        super.visitCallExpression(node);
    }
}
