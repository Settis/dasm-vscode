import { BasicNode } from "./nodes";

export type LabelsByName = Map<string, LabelObject>

export type LabelObject = {
    name: string,
    definedAsConstant: boolean,
    definedAsVariable: boolean,
    definitions: BasicNode[],
    usages: BasicNode[]
}
