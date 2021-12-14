import { Node, NodeType, ProgramNode } from "../ast";
import { MSG } from "../messages";
import { validateCommand } from "./asmCommandValidator";
import { constructError, DiagnosticWithURI } from "./util";

export function validateProgram(program: ProgramNode): DiagnosticWithURI[] {
    return validateNode(program).concat(validateLabels(program));
}

function validateNode(node: Node): DiagnosticWithURI[] {
    const result: DiagnosticWithURI[] = [];
    if (node.type === NodeType.Command)
        result.push(...validateCommand(node));
    result.push(...node.children.flatMap(it => validateNode(it)));
    return result;
}

function validateLabels(program: ProgramNode): DiagnosticWithURI[] {
    const result: DiagnosticWithURI[] = [];
    for (const labelName in program.labels) {
        const relatedLabel = program.labels[labelName];
        if (relatedLabel.definitions.length == 0)
            for (const usage of relatedLabel.usages)
                result.push(constructError(MSG.LABEL_NOT_DEFINED, usage));
        if (relatedLabel.definitions.length > 1)
            for (let i = 1; i < relatedLabel.definitions.length; i++)
                result.push(constructError(MSG.TOO_MANY_DEFINITIONS, relatedLabel.definitions[i]));
    }
    return result;
}
