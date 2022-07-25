import { MSG } from "../messages";
import { LabelsByName } from "../parser/ast/labels";
import { MacrosByName } from "../parser/ast/macros";
import { AllComandNode, FileNode, IfDirectiveNode, LineNode, MacroDirectiveNode, NodeType, RepeatDirectiveNode } from "../parser/ast/nodes";
import { Program } from "../program";
import { notEmpty } from "../utils";
import { validateGeneralCommand } from "./asmCommandValidator";
import { constructError, DiagnosticWithURI } from "./util";

export function validateFile(fileNode: FileNode): DiagnosticWithURI[] {
    return validateLines(fileNode.lines);
}

export function validateProgram(program: Program): DiagnosticWithURI[] {
    const result: DiagnosticWithURI[] = [];
    result.push(...validateLabelsInContext(program.globalLabels));
    for (const context of program.localLabels)
        result.push(...validateLabelsInContext(context));
    result.push(...validateMacros(program.macroses));
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
    return [];
}

function validateLabelsInContext(context: LabelsByName): DiagnosticWithURI[] {
    const result: DiagnosticWithURI[] = [];
    for (const relatedLabel of context.values()) {
        if (relatedLabel.definitions.length == 0)
            for (const usage of relatedLabel.usages)
                result.push(constructError(MSG.LABEL_NOT_DEFINED, usage));
        if (relatedLabel.definedAsConstant && relatedLabel.definedAsVariable) {
            for (const definition of relatedLabel.definitions)
                result.push(constructError(MSG.LABEL_AS_VAR_AND_CONSTANT, definition));
            continue;
        }
        if (relatedLabel.definitions.length > 1 && relatedLabel.definedAsConstant)
            for (let i = 1; i < relatedLabel.definitions.length; i++)
                result.push(constructError(MSG.TOO_MANY_DEFINITIONS, relatedLabel.definitions[i]));
        
    }
    return result;
}

function validateMacros(macroses: MacrosByName): DiagnosticWithURI[] {
    const result: DiagnosticWithURI[] = [];
    for (const macros of macroses.values())
        if (macros.definitions.length == 0)
            for (const usage of macros.usages)
                result.push(constructError(MSG.UNKNOWN_COMMAND, usage));
    return result;
}
