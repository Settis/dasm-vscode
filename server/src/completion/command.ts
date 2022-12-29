import { CompletionItem, CompletionItemKind } from "vscode-languageserver";
import { operations } from "../dasm/operations";

export function onCommandCompletion(): CompletionItem[] {
    return Object.entries(operations)
        .map(([key, value]) => { return {
            label: key,
            kind: CompletionItemKind.Keyword,
            documentation: value.title
        }});
}
