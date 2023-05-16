import { RORG } from "../dasm/directives";
import { MSG } from "../messages";
import { LabelObject, LabelsByName } from "../parser/ast/labels";
import { MacrosByName } from "../parser/ast/macros";
import { AllComandNode, CommandNode, FileNode, IfDirectiveNode, LineNode, MacroDirectiveNode, NodeType, RepeatDirectiveNode } from "../parser/ast/nodes";
import { Program } from "../program";
import { notEmpty } from "../utils";
import { unifyCommandName, validateGeneralCommand } from "./asmCommandValidator";
import { constructError, constructWarning, DiagnosticWithURI } from "./util";

export function validateFile(fileNode: FileNode): DiagnosticWithURI[] {
    return validateLines(fileNode.lines);
}

export function validateProgram(program: Program): DiagnosticWithURI[] {
    const result: DiagnosticWithURI[] = [];
    result.push(...validateLabelsInContext(program.globalLabels, program.dynamicLabelsPrefixes));
    for (const context of program.localLabels)
        result.push(...validateLabelsInContext(context, program.dynamicLabelsPrefixes));
    result.push(...validateMacros(program.macroses));
    result.push(...validateRelocatableDirectives(program.relocatableDirectives));
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

function validateLabelsInContext(context: LabelsByName, dynamicLabelsPrefixes: Set<string>): DiagnosticWithURI[] {
    const result: DiagnosticWithURI[] = [];
    for (const relatedLabel of context.values()) {
        if (labelMayBeDynamic(relatedLabel, dynamicLabelsPrefixes)) continue;
        result.push(...getLabelNotDefinedErrors(relatedLabel));
        result.push(...getLabelAsVarAndConstantErrors(relatedLabel));
        result.push(...getLabelTooManyDefinitionsErrors(relatedLabel));
    }
    return result;
}

function labelMayBeDynamic(label: LabelObject, dynamicLabelsPrefixes: Set<string>): boolean {
    const name = label.name;
    for (const prefix of dynamicLabelsPrefixes)
        if (name.startsWith(prefix)) return true;
    return false;
}

function getLabelNotDefinedErrors(label: LabelObject): DiagnosticWithURI[] {
    const result: DiagnosticWithURI[] = [];
    if (label.definitions.length == 0)
            for (const usage of label.usages)
                result.push(constructError(MSG.LABEL_NOT_DEFINED, usage));
    return result;
}

function getLabelAsVarAndConstantErrors(label: LabelObject): DiagnosticWithURI[] {
    const result: DiagnosticWithURI[] = [];
    if (label.definedAsConstant && label.definedAsVariable)
        for (const definition of label.definitions)
            result.push(constructError(MSG.LABEL_AS_VAR_AND_CONSTANT, definition));
    return result;
}

function getLabelTooManyDefinitionsErrors(label: LabelObject): DiagnosticWithURI[] {
    const result: DiagnosticWithURI[] = [];
    if (label.definitions.length > 1 && label.definedAsConstant)
            for (let i = 1; i < label.definitions.length; i++)
                result.push(constructError(MSG.TOO_MANY_DEFINITIONS, label.definitions[i]));
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

function validateRelocatableDirectives(directives: CommandNode[]): DiagnosticWithURI[] {
    const result: DiagnosticWithURI[] = [];
    let hasRelocatableSection = false;
    for (const command of directives)
        if (unifyCommandName(command.name.name) === RORG) {
            if (command.args.length == 0) 
                result.push(constructWarning(MSG.NO_ARG, command));
            if (hasRelocatableSection)
                result.push(constructWarning(MSG.RORG_TWICE_OPENED, command));
            hasRelocatableSection = true;
        } else {
            if (!hasRelocatableSection)
                result.push(constructWarning(MSG.NO_RORG_SECTION, command));
            hasRelocatableSection = false;
        }
    return result;
}
