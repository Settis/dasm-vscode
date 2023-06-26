import { CompletionItem, CompletionItemKind } from "vscode-languageserver";
import { Program } from "../program";
import { getDocumentSettings } from "../server";

export async function onLabelCompletion(program: Program | undefined, includeConstant = false): Promise<CompletionItem[]> {
    if (program === undefined) return [];
    const result: CompletionItem[] = [];
    const hidePrefixes = (await getDocumentSettings(program.uri)).labels.hidePrefix ?? [];
    for (const label of program.globalLabels.values()) {
        if ((includeConstant || label.definedAsVariable) && canShow(label.name, hidePrefixes)) {
            result.push({
                label: label.name,
                kind: label.definedAsVariable ? CompletionItemKind.Variable : CompletionItemKind.Constant
            });
        }
    }
    return result;
}

function canShow(labenName: string, hidePrefixes: string[]): boolean {
    for (const prefix of hidePrefixes)
        if (labenName.startsWith(prefix)) return false;
    return true;
}
