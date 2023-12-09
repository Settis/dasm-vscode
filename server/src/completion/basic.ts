import { CompletionItem, CompletionItemKind, Position, Range, TextDocumentPositionParams } from "vscode-languageserver";
import { documents, programs } from "../server";
import { onCommandCompletion } from "./command";
import { onLabelCompletion } from "./label";
import { filterStrucMacLabels, getStrucMacSnippets, isStrucMacEnabled } from "./strucMac";

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
  let result: CompletionItem[] = [];
  // 1 - label
  if (splitLength == 1)
    result = await onLabelCompletion(program);
  // 2 - command
  else if (splitLength == 2)
    result = onCommandCompletion(program);
  // 3 - after the command
  else if (splitLength >= 3) {
    if (splitResult[splitLength-1].indexOf(',') == -1) // and this not contain "," so it's not an addressing scecifaction
      result = await onLabelCompletion(program, true);
    else
      result = [
        {label: 'X', kind: CompletionItemKind.Keyword}, 
        {label: 'Y', kind: CompletionItemKind.Keyword}
      ];
  }
  if (isStrucMacEnabled(program)) {
    result = result.filter(filterStrucMacLabels);
    result = result.concat(getStrucMacSnippets());
  }
  return result;
}

export function onCompletionResolveImpl(item: CompletionItem): CompletionItem {
    return item; 
}
