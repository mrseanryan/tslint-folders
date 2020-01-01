import * as Lint from "tslint";
import * as ts from "typescript";

import { ConfigFactory } from "./config/ConfigFactory";
import { DisabledTestRuleConfig } from "./model/DisabledTestRuleConfig";
import { RuleId } from "./RuleId";
import { GeneralRuleUtils } from "./utils/GeneralRuleUtils";

// note: MUST be named exactly 'Rule' to be picked up by tslint
export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        const config = ConfigFactory.createForDisabledTestRule(this.getOptions());

        if (!GeneralRuleUtils.isFileInPaths(sourceFile.fileName, config.includePaths)) {
            return [];
        }

        return this.applyWithFunction<DisabledTestRuleConfig>(sourceFile, walk, config);
    }
}

const walk = (ctx: Lint.WalkContext<DisabledTestRuleConfig>) => {
    return ts.forEachChild(ctx.sourceFile, checkNode);

    function checkNode(node: ts.Node): void {
        if (node.kind === ts.SyntaxKind.CallExpression) {
            visitCallExpression(node as ts.CallExpression, ctx);
        }

        return ts.forEachChild(node, checkNode);
    }
};

function visitCallExpression(
    node: ts.CallExpression,
    ctx: Lint.WalkContext<DisabledTestRuleConfig>
) {
    const text = node.getText();

    if (ctx.options.ban.some(token => text.startsWith(token))) {
        ctx.addFailureAtNode(
            node.getFirstToken() || node,
            GeneralRuleUtils.buildFailureString(
                "do not disable or enable only some tests",
                RuleId.TsfFoldersDisabledTest
            )
        );
    }
}
