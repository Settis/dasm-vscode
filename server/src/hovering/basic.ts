import { Hover } from "vscode-languageserver";
import { AstNode } from "../parser/ast/nodes";
import { getCommandHover } from "./command";

export function getHover(nodes: AstNode[]): Hover | undefined {
    let hover = getCommandHover(nodes);
    if (hover) return hover;
    // hover = getAnotherHover(node);
}
