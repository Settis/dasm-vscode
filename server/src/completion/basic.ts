import { CompletionItem, Position, Range, TextDocumentPositionParams } from "vscode-languageserver";
import { documents } from "../server";
import { onCommandCompletion } from "./command";

export function onCompletionImpl(positionParams: TextDocumentPositionParams): CompletionItem[] {
  const document = documents.get(positionParams.textDocument.uri);
  if (document === undefined) return [];
  const line = document.getText(
    Range.create(
      Position.create(positionParams.position.line, 0), 
      Position.create(positionParams.position.line, positionParams.position.character)));
  const splitResult = line.split(/\s+/).length;
  // 1 - label
  // 2 - command
  // 3 - after the command
  if (splitResult == 2)
    return onCommandCompletion();
  return [];
}

export function onCompletionResolveImpl(item: CompletionItem): CompletionItem {
    return item; 
}