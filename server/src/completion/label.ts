import { CompletionItem, CompletionItemKind } from "vscode-languageserver";
import { Program } from "../program";
import { getDocumentSettings } from "../server";
import { LabelObject } from "../parser/ast/labels";
import { AstNode } from "../parser/ast/nodes";

export async function onLabelCompletion(program: Program | undefined, parentPrograms: Program[], includeConstant = false): Promise<CompletionItem[]> {
    if (program === undefined) return [];
    const result: CompletionItem[] = [];
    const localPrefixes = (await getDocumentSettings(program.uri)).labels.localPrefix ?? [];
    const localLabelsChecker = new LocalLabelsChecker(program.uri, localPrefixes);
    const lables: LabelObject[] = [...program.globalLabels.values()];
    for (const parentProgram of parentPrograms)
        lables.push(...parentProgram.globalLabels.values());
    for (const label of lables) {
        if ((includeConstant || label.definedAsVariable) && localLabelsChecker.canShow(label)) {
            result.push({
                label: label.name,
                kind: label.definedAsVariable ? CompletionItemKind.Variable : CompletionItemKind.Constant
            });
        }
    }
    return result;
}

class LocalLabelsChecker {
    public constructor(private uri: string, private localPrefixes: string[]) {}

    public canShow(label: LabelObject): boolean {
        if (this.hasLocalPrefix(label.name))
            return this.theSameDocument(label.definitions);
        return true;
    }

    private hasLocalPrefix(labelName: string): boolean {
        for (const prefix of this.localPrefixes)
            if (labelName.startsWith(prefix)) return true;
        return false;
    }

    private theSameDocument(definitions: AstNode[]): boolean {
        for (const definition of definitions)
            if (definition.location.uri === this.uri) return true;
        return false;
    }
}
