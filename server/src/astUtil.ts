import { Position } from "vscode-languageserver-textdocument";
import { Node, NodeType } from "./ast";

export function getNearestParentByType(startingNode: Node, nodeType: NodeType): Node | undefined {
    const parent = startingNode.parent;
    if (parent) {
        if (parent.type == nodeType) return parent;
        return getNearestParentByType(parent, nodeType);
    }
    return undefined;
}

interface PositionWithUri extends Position {
    uri: string
}

export function getNodeByPosition(startingNode: Node, position: PositionWithUri): Node | undefined {
    if (!isPositionInsideNode(position, startingNode)) return;
    for (const child of startingNode.children) {
        const result = getNodeByPosition(child, position);
        if (result) return result;
    }
    return startingNode;
}

export function isPositionInsideNode(position: PositionWithUri, node: Node): boolean {
    return position.uri === node.location.uri 
        && compare(node.location.range.start, position) < 1 
        && compare(position, node.location.range.end) < 1;
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