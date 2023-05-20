import { CompletionItem, CompletionItemKind } from "vscode-languageserver";
import { Program } from "../program";

export function onLabelCompletion(program: Program | undefined, includeConstant = false): CompletionItem[] {
    if (program === undefined) return [];
    const result: CompletionItem[] = [];
    for (const label of program.globalLabels.values()) {
        if (includeConstant || label.definedAsVariable) {
            result.push({
                label: label.name,
                kind: label.definedAsVariable ? CompletionItemKind.Variable : CompletionItemKind.Constant
            });
        }
    }
    return result;
}