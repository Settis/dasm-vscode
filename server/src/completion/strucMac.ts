import { CompletionItem, CompletionItemKind, InsertTextFormat } from "vscode-languageserver";
import { Program } from "../program";
import { DATA } from "./structureMacros";

const STRUC_MAC_NAMES = new Set<string>([
    // Constants
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
    // Macroses
    'IF_EQ',
    'ELSE_',
    'END_IF',
    'IF_ZERO',
    'IF_NEQ',
    'IF_NOT_ZERO',
    'IF_PLUS',
    'IF_MINUS',
    'IF_NEG',
    'IF_C_SET',
    'IF_C_CLR',
    'IF_GE',
    'IF_LT',
    'IF_V_SET',
    'IF_V_CLR',
    'IF_FLAG_VAR',
    'IF_BIT',
    'IF_MEM_BYTE_NEG',
    'IF_MEM_BYTE_POS',
    'BEGIN',
    'AGAIN',
    'WHILE_EQ',
    'REPEAT_',
    'WHILE_NEQ',
    'WHILE_ZERO',
    'WHILE_NOT_ZERO',
    'WHILE_PLUS',
    'WHILE_MINUS',
    'WHILE_NEG',
    'WHILE_C_CLR',
    'WHILE_C_SET',
    'WHILE_GE',
    'WHILE_LT',
    'WHILE_V_CLR',
    'WHILE_V_SET',
    'WHILE_BIT',
    'UNTIL_EQ',
    'UNTIL_ZERO',
    'UNTIL_NEQ',
    'UNTIL_NOT_ZERO',
    'UNTIL_PLUS',
    'UNTIL_MINUS',
    'UNTIL_NEG',
    'UNTIL_C_CLR',
    'UNTIL_C_SET',
    'UNTIL_GE',
    'UNTIL_LT',
    'UNTIL_V_CLR',
    'UNTIL_V_SET',
    'UNTIL_BIT',
    'CASE',
    'CASE_OF',
    'END_OF',
    'END_CASE',
    'FOR',
    'NEXT',
    'FOR_X',
    'NEXT_X',
    'FOR_Y',
    'NEXT_Y',
    'RTS_IF_EQ',
    'RTS_IF_NE',
    'RTS_IF_PLUS',
    'RTS_IF_MINUS',
    'RTS_IF_FLAG_VAR',
    'RTS_IF_BIT',
    'RTS_IF_MEM_LOC',
]);

const STRUCMAC_FILE = 'STRUCMAC.ASM';

export function isStrucMacEnabled(program: Program | undefined, parentPrograms: Program[]): boolean {
    if (!program) return false;
    const totalUsedFiles = new Set<string>(program.usedFiles);
    for (const parentProgram of parentPrograms)
        parentProgram.usedFiles.forEach(it => totalUsedFiles.add(it));
    return [...totalUsedFiles].findIndex(item => item.endsWith(STRUCMAC_FILE)) != -1;
}

export function filterStrucMacLabels(completionItem: CompletionItem): boolean {
    return !STRUC_MAC_NAMES.has(completionItem.label);
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
