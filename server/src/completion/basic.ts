import { CompletionItem, Position, Range, TextDocumentPositionParams } from "vscode-languageserver";
import { documents, programs } from "../server";
import { onCommandCompletion } from "./command";
import { onLabelCompletion } from "./label";

export async function onCompletionImpl(positionParams: TextDocumentPositionParams): Promise<CompletionItem[]> {
  const documentUri = positionParams.textDocument.uri;
  const document = documents.get(documentUri);
  if (document === undefined) return [];
  const line = document.getText(
    Range.create(
      Position.create(positionParams.position.line, 0), 
      Position.create(positionParams.position.line, positionParams.position.character)));
  const splitResult = line.split(/\s+/).length;
  const program = programs.get(documentUri);
  // 1 - label
  if (splitResult == 1)
    return await onLabelCompletion(program);
  // 2 - command
  if (splitResult == 2)
    return onCommandCompletion(program);
  // 3 - after the command
  if (splitResult >= 3)
    return await onLabelCompletion(program, true);
  return [];
}

export function onCompletionResolveImpl(item: CompletionItem): CompletionItem {
    return item; 
}
