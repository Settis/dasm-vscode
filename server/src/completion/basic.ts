import { CompletionItem, CompletionItemKind, Position, Range, TextDocumentPositionParams } from "vscode-languageserver";
import { documents, programs } from "../server";
import { onCommandCompletion } from "./command";
import { onLabelCompletion } from "./label";
import { filterStrucMacLabels, getStrucMacSnippets, isStrucMacEnabled } from "./strucMac";
import { Program } from "../program";

export async function onCompletionImpl(positionParams: TextDocumentPositionParams): Promise<CompletionItem[]> {
  const documentUri = positionParams.textDocument.uri;
  const document = documents.get(documentUri);
  if (document === undefined) return [];
  const line = document.getText(
    Range.create(
      Position.create(positionParams.position.line, 0), 
      Position.create(positionParams.position.line, positionParams.position.character)));
  const splitResult = line.split(/\s+/);
  const splitLength = splitResult.length;
  const program = programs.get(documentUri);
  const parentPrograms = [...programs.values()].filter(it => it.usedFiles.has(documentUri));
  let result: CompletionItem[] = [];
  // 1 - label
  if (splitLength == 1)
    result = await onLabelCompletion(program, parentPrograms);
  // 2 - command
  else if (splitLength == 2)
    result = onCommandCompletion(program, parentPrograms);
  // 3 - after the command
  else if (splitLength >= 3) {
    result = await afterCommandCompletion(program, parentPrograms, splitResult[splitLength-1]);
    
  }
  if (isStrucMacEnabled(program, parentPrograms)) {
    result = result.filter(filterStrucMacLabels);
    result = result.concat(getStrucMacSnippets());
  }
  return result;
}

async function afterCommandCompletion(program: Program | undefined, parentPrograms: Program[], word: string): Promise<CompletionItem[]> {
  if (word.indexOf(',') != -1) // and this xcontain "," so it's an addressing scecifaction
    return [
      {label: 'X', kind: CompletionItemKind.Keyword}, 
      {label: 'Y', kind: CompletionItemKind.Keyword}
    ];
  if (word.indexOf('$') != -1) // it's probably a hex number
    // VSCode will show everything possible on the empty array
    // So I must return something
    return [{label: '$', kind: CompletionItemKind.Keyword}]; 
  return await onLabelCompletion(program, parentPrograms, true);
}

export function onCompletionResolveImpl(item: CompletionItem): CompletionItem {
    return item; 
}
