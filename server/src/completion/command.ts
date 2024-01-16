import { CompletionItem, CompletionItemKind } from "vscode-languageserver";
import { operations } from "../dasm/operations";
import { NAMES } from "../dasm/directives";
import { Program } from "../program";

export function onCommandCompletion(program: Program | undefined, parentPrograms: Program[]): CompletionItem[] {
    const result = operationCompletion();
    result.push(...directivesCompletion());
    if (program)
        result.push(...macrosCompletion(program));
    for (const program of parentPrograms)
        result.push(...macrosCompletion(program));
    return result;
}

function operationCompletion(): CompletionItem[] {
    return Object.entries(operations)
        .map(([key, value]) => { return {
            label: key,
            kind: CompletionItemKind.Operator,
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

function macrosCompletion(program: Program): CompletionItem[] {
    return Array.from(program.macroses.keys())
        .map(it => { return {
            label: it,
            kind: CompletionItemKind.Method,
        };});
}
