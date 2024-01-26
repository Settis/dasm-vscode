import { CompletionItem, CompletionItemKind } from "vscode-languageserver";
import { Program } from "../program";

export function onSegmentCompletion(program: Program | undefined, parentPrograms: Program[]): CompletionItem[] {
    const segmentNames: Set<string> = new Set();
    const allPrograms: Program[] = [...parentPrograms];
    if (program) allPrograms.push(program);
    for (const aProgram of allPrograms)
        for (const segment of aProgram.segments.keys()) 
            segmentNames.add(segment);
    const result: CompletionItem[] = [];
    for (const segmentName of segmentNames)
        result.push({
            label: segmentName,
            kind: CompletionItemKind.Variable
        });
    return result;
}
