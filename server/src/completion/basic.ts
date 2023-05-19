import { CompletionItem, Position, Range, TextDocumentPositionParams } from "vscode-languageserver";
import { documents, programs } from "../server";
import { onCommandCompletion } from "./command";
import { onLabelCompletion } from "./label";

export function onCompletionImpl(positionParams: TextDocumentPositionParams): CompletionItem[] {
  const document = documents.get(positionParams.textDocument.uri);
  if (document === undefined) return [];
  const line = document.getText(
    Range.create(
      Position.create(positionParams.position.line, 0), 
      Position.create(positionParams.position.line, positionParams.position.character)));
  const splitResult = line.split(/\s+/).length;
  const program = programs.get(positionParams.textDocument.uri);
  // 1 - label
  if (splitResult == 1)
    return onLabelCompletion(program);
  // 2 - command
  if (splitResult == 2)
    return onCommandCompletion(program);
  // 3 - after the command
  if (splitResult == 3)
    return onLabelCompletion(program, true);
  return [];
}

export function onCompletionResolveImpl(item: CompletionItem): CompletionItem {
    return item; 
}
