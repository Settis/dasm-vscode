import { Node, NodeType, RelatedContext } from "../ast/nodes";
import { MSG } from "../messages";
import { Program } from "../program";
import { validateCommand } from "./asmCommandValidator";
import { constructError, DiagnosticWithURI } from "./util";

export function validateNode(node: Node): DiagnosticWithURI[] {
    const result: DiagnosticWithURI[] = [];
    if (node.type === NodeType.Command)
        result.push(...validateCommand(node));
    result.push(...node.children.flatMap(it => validateNode(it)));
    return result;
}

export function validateLabels(program: Program): DiagnosticWithURI[] {
    const result: DiagnosticWithURI[] = [];
    result.push(...validateLabelsInContext(program.labels));
    for (const context of program.localLabels)
        result.push(...validateLabelsInContext(context));
    return result;
}

function validateLabelsInContext(context: RelatedContext): DiagnosticWithURI[] {
    const result: DiagnosticWithURI[] = [];
    for (const labelName in context) {
        const relatedLabel = context[labelName];
        if (relatedLabel.definitions.length == 0)
            for (const usage of relatedLabel.usages)
                result.push(constructError(MSG.LABEL_NOT_DEFINED, usage));
        if (relatedLabel.definitions.length > 1)
            for (let i = 1; i < relatedLabel.definitions.length; i++)
                result.push(constructError(MSG.TOO_MANY_DEFINITIONS, relatedLabel.definitions[i]));
    }
    return result;
}
