import { CompletionItem, CompletionItemKind, InsertTextFormat } from "vscode-languageserver";
import { Program } from "../program";
import { DATA } from "./structureMacros";

const STRUC_MAC_LABELS = new Set<string>([
	'IS_SET',
	'IS_CLEAR',
	'IS_HIGH',
	'IS_LOW',
	'UP_TO',
	'DOWN_TO',
	'IS_POS',
	'IS_NEG',
	'IS_0',
	'IS_NON_0',
	'NEG_NRs',
	'POS_NRs',
	'ACCUM',
	'X_REG',
	'Y_REG',
]);

const STRUCMAC_FILE = 'STRUCMAC.ASM';

export function isStrucMacEnabled(program: Program | undefined): boolean {
    const usedFiles = program?.usedFiles;
    if (usedFiles == undefined) return false;
    return [...usedFiles].findIndex(item => item.endsWith(STRUCMAC_FILE)) != -1;
}

export function filterStrucMacLabels(completionItem: CompletionItem): boolean {
    return !STRUC_MAC_LABELS.has(completionItem.label);
}

let strucMacSnippets: CompletionItem[] | null = null;

export function getStrucMacSnippets(): CompletionItem[] {
    if (strucMacSnippets == null)
        strucMacSnippets = readStrucMacSnippets();
    return strucMacSnippets;
}

function readStrucMacSnippets(): CompletionItem[] {
    return Object.values(DATA).map(item => {
        return {
            label: item.prefix,
            kind: CompletionItemKind.Snippet,
            insertTextFormat: InsertTextFormat.Snippet,
            insertText: item.body.join('\n'),
            documentation: item.description
        };
    });
}
