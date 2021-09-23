import { Node, NodeType, ProgramNode } from "../ast";
import { validateCommand } from "./asmCommandValidator";
import { DiagnosticWithURI } from "./util";

export function validateProgram(program: ProgramNode): DiagnosticWithURI[] {
    return validateNode(program);
}

function validateNode(node: Node): DiagnosticWithURI[] {
    const result: DiagnosticWithURI[] = [];
    if (node.type === NodeType.Command)
        result.push(...validateCommand(node));
    result.push(...node.children.flatMap(it => validateNode(it)));
    return result;
}