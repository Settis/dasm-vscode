import { Hover } from "vscode-languageserver";
import { AstNode } from "../parser/ast/nodes";
import { getCommandHover } from "./command";

export function getHover(nodes: AstNode[]): Hover | undefined {
    const hover = getCommandHover(nodes);
    if (hover) return hover;
    // later I can reassing hover like this: hover = getAnotherHover(node);
}
