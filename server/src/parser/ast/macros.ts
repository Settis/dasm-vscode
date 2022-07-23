import { BasicNode } from "./nodes";

export type MacrosByName = Map<string, MacrosObject>

export type MacrosObject = {
    name: string,
    definitions: BasicNode[],
    usages: BasicNode[]
}
