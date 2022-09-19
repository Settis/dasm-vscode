import { AstNode } from "./nodes";

export const ALIASES = new Set<string>(['...', '..', '.', '*']);

export type LabelsByName = Map<string, LabelObject>

export type LabelObject = {
    name: string,
    definedAsConstant: boolean,
    definedAsVariable: boolean,
    definitions: AstNode[],
    usages: AstNode[]
}

export function mergeLabelsMap(first: LabelsByName, second: LabelsByName): LabelsByName {
    const result: LabelsByName = new Map();
    for (const label of first.values())
        result.set(label.name, {
            name: label.name,
            definedAsConstant: label.definedAsConstant,
            definedAsVariable: label.definedAsVariable,
            definitions: [...label.definitions],
            usages: [...label.usages],
        });
    for (const label of second.values()) {
        let updatedLabel = result.get(label.name);
        if (updatedLabel)
            updatedLabel = mergeLabelObject(updatedLabel, label);
        else
            updatedLabel = label;
        result.set(label.name, updatedLabel);
    }
    return result;
}

function mergeLabelObject(first: LabelObject, second: LabelObject): LabelObject {
    const definitions = [];
    definitions.push(...first.definitions);
    definitions.push(...second.definitions);
    const usages = [];
    usages.push(...first.usages);
    usages.push(...second.usages);
    return {
        name: first.name,
        definedAsConstant: first.definedAsConstant || second.definedAsConstant,
        definedAsVariable: first.definedAsVariable || second.definedAsVariable,
        definitions,
        usages,
    };
}
