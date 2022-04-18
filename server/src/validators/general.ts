import { MSG } from "../messages";
import { AllComandNode, FileNode, IfDirectiveNode, LineNode, MacroDirectiveNode, NodeType, RepeatDirectiveNode } from "../parser/ast/nodes";
import { RelatedContextByName } from "../parser/ast/related";
import { Program } from "../program";
import { notEmpty } from "../utils";
import { validateGeneralCommand } from "./asmCommandValidator";
import { constructError, DiagnosticWithURI } from "./util";

export function validateProgram(fileNode: FileNode): DiagnosticWithURI[] {
    return validateLines(fileNode.lines);
}

export function validateLabels(program: Program): DiagnosticWithURI[] {
    const result: DiagnosticWithURI[] = [];
    result.push(...validateLabelsInContext(program.labels));
    for (const context of program.localLabels)
        result.push(...validateLabelsInContext(context));
    return result;
}

function validateLines(lines: LineNode[]): DiagnosticWithURI[] {
    return lines.map(line => line.command)
        .filter(notEmpty)
        .flatMap(validateCommand);
}

function validateCommand(command: AllComandNode): DiagnosticWithURI[] {
    switch (command.type) {
        case NodeType.Command:
            return validateGeneralCommand(command);
        case NodeType.IfDirective:
            return validateIfCommand(command);
        case NodeType.RepeatDirective:
            return validateRepeatCommand(command);
        case NodeType.MacroDirective:
            return validateMacroCommand(command);
    }
}

function validateIfCommand(command: IfDirectiveNode): DiagnosticWithURI[] {
    const errors = validateLines(command.thenBody);
    errors.push(...validateLines(command.elseBody));
    return errors;
}

function validateRepeatCommand(command: RepeatDirectiveNode): DiagnosticWithURI[] {
    return validateLines(command.body);
}

function validateMacroCommand(command: MacroDirectiveNode): DiagnosticWithURI[] {
    return validateLines(command.body);
}

function validateLabelsInContext(context: RelatedContextByName): DiagnosticWithURI[] {
    const result: DiagnosticWithURI[] = [];
    for (const relatedLabel of context.values()) {
        if (relatedLabel.definitions.length == 0)
            for (const usage of relatedLabel.usages)
                result.push(constructError(MSG.LABEL_NOT_DEFINED, usage));
        if (relatedLabel.definitions.length > 1)
            for (let i = 1; i < relatedLabel.definitions.length; i++)
                result.push(constructError(MSG.TOO_MANY_DEFINITIONS, relatedLabel.definitions[i]));
    }
    return result;
}
