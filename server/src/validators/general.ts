import { MSG } from "../messages";
import { FileNode } from "../parser/ast/nodes";
import { RelatedContextByName } from "../parser/ast/related";
import { Program } from "../program";
import { validateCommand } from "./asmCommandValidator";
import { constructError, DiagnosticWithURI } from "./util";

export function validateProgram(fileNode: FileNode): DiagnosticWithURI[] {
    return fileNode.lines
        .map(line => line.command)
        .filter(command => command !== null)
        .flatMap(command => validateCommand(command!));
}

export function validateLabels(program: Program): DiagnosticWithURI[] {
    const result: DiagnosticWithURI[] = [];
    result.push(...validateLabelsInContext(program.labels));
    for (const context of program.localLabels)
        result.push(...validateLabelsInContext(context));
    return result;
}

function validateLabelsInContext(context: RelatedContextByName): DiagnosticWithURI[] {
    const result: DiagnosticWithURI[] = [];
    for (const labelName in context.keys()) {
        const relatedLabel = context.get(labelName)!;
        if (relatedLabel.definitions.length == 0)
            for (const usage of relatedLabel.usages)
                result.push(constructError(MSG.LABEL_NOT_DEFINED, usage));
        if (relatedLabel.definitions.length > 1)
            for (let i = 1; i < relatedLabel.definitions.length; i++)
                result.push(constructError(MSG.TOO_MANY_DEFINITIONS, relatedLabel.definitions[i]));
    }
    return result;
}
