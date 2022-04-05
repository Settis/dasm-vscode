import { Position } from "vscode-languageserver-textdocument";
import { BasicNode } from "../parser/ast/nodes";
import { Node, NodeType, CommandNameNode, ArgumentsNode, NumberNode } from "./nodes";

interface PositionWithUri extends Position {
    uri: string
}

export function getNodeByPosition(startingNode: BasicNode, position: PositionWithUri): BasicNode | undefined {
    if (!isPositionInsideNode(position, startingNode)) return;
    for (const child of startingNode.getChildren()) {
        const result = getNodeByPosition(child, position);
        if (result) return result;
    }
    return startingNode;
}

export function isPositionInsideNode(position: PositionWithUri, node: BasicNode): boolean {
    return position.uri === node.location.uri 
        && compare(node.location.range.start, position) < 1 
        && compare(position, node.location.range.end) < 1;
}

export function getArguments(node: CommandNameNode): ArgumentsNode | undefined {
    return node.parent?.children.find(isArguments);
}

export function isArguments(node: Node): node is ArgumentsNode {
    return node.type === NodeType.Arguments;
}

export function isCommandName(node: Node): node is CommandNameNode {
    return node.type === NodeType.CommandName;
}

export function isNumber(node: Node): node is NumberNode {
    return node.type === NodeType.Number;
}

/**
 * 1: if (x > y)
 * 
 * 0: if (x==y)
 * 
 * -1: if (x < y)
 * @param x one position
 * @param y another position
 */
function compare(x: Position, y: Position): number {
    const lineComparison = compareNumbers(x.line, y.line);
    if (lineComparison === 0) return compareNumbers(x.character, y.character);
    return lineComparison;
}

function compareNumbers(x: number, y: number): number {
    if (x === y) return 0;
    if (x > y) return 1;
    return -1;
}
