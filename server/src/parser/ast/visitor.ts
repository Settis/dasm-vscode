import { Location, Range } from "vscode-languageserver";
import { TextCstNode } from "../cst/cstTypes";
import { FileNode } from "./nodes";

export class Visitor {
    constructor(
        readonly uri: string
    ) {}

    public constructAst(text: TextCstNode): FileNode {
        return new FileNode(Location.create(this.uri, Range.create(0, 0, 1, 1)), []);
    }
}
