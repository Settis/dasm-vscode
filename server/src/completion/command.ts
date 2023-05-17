import { CompletionItem, CompletionItemKind } from "vscode-languageserver";
import { operations } from "../dasm/operations";
import { NAMES } from "../dasm/directives";

export function onCommandCompletion(): CompletionItem[] {
    const result = operationCompletion();
    result.push(...directivesCompletion());
    return result;
}

function operationCompletion(): CompletionItem[] {
    return Object.entries(operations)
        .map(([key, value]) => { return {
            label: key,
            kind: CompletionItemKind.Keyword,
            documentation: value.title
        };});
}

function directivesCompletion(): CompletionItem[] {
    return Array.from(NAMES)
        .map(it => { return {
            label: it,
            kind: CompletionItemKind.Keyword,
        };});
}
