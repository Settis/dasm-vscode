import { BasicNode } from "./nodes";

export type RelatedContextByName = Map<string, RelatedObject>

export type RelatedContextByNode = Map<BasicNode, RelatedObject>

export type RelatedObject = {
    definitions: BasicNode[],
    usages: BasicNode[]
}
