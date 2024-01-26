import { AstNode } from "./nodes";

export type SegmentsByName = Map<string, SegmentObject>

export type SegmentObject = {
    name: string,
    definitions: AstNode[],
    usages: AstNode[],
}
