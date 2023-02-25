import { INCBIN, INCDIR, INCLUDE, LIST, NAMES, SEG, SET, SETSTR, SUBROUTINE } from "./dasm/directives";
import { getFolder, isExists, joinUri } from "./localFiles";
import { MSG } from "./messages";
import { ParsedFiles } from "./parsedFiles";
import { AllComandNode, ArgumentNode, CommandNode, ExpressionNode, FileNode, IdentifierNode, IfDirectiveNode, LabelNode, LineNode, MacroDirectiveNode, NodeType, RepeatDirectiveNode } from "./parser/ast/nodes";
import { LabelsByName, LabelObject, ALIASES, mergeLabelsMap } from "./parser/ast/labels";
import { constructError, constructWarning, DiagnosticWithURI } from "./validators/util";
import { operations } from "./dasm/operations";
import { MacrosByName, MacrosObject } from "./parser/ast/macros";
import { UnifiedCommandName, unifyCommandName } from "./validators/asmCommandValidator";
import { parseText } from "./parser/ast/utils";
import * as path from 'path';

const LOCAL_LABEL_PREFIX = '.';

export class Program {
    constructor(private parsedFiles: ParsedFiles, private uri: string) {
        this.folderUri = getFolder(uri);
        this.macrosCalls = new MacrosCalls(parsedFiles, uri);
    }

    public globalLabels: LabelsByName = new Map();
    public localLabels: LabelsByName[] = [new Map()];
    public macroses: MacrosByName = new Map();
    private folderUri: string;
    private includeFolders = new Set<string>();
    public errors: DiagnosticWithURI[] = [];
    public usedFiles = new Set<string>();
    private currentlyIncludedStack = new Set<string>();
    private macrosCalls: MacrosCalls;

    public assemble() {
        this.visitFile(this.uri);
        const macroResult = this.macrosCalls.getMacroResult();
        this.globalLabels = mergeLabelsMap(this.globalLabels, macroResult.labels);
        this.errors.push(...macroResult.errors);
    }

    private visitFile(uri: string) {
        const ast = this.parsedFiles.getFileAst(uri);
        if (ast) this.visitFileNode(ast);
    }

    public visitFileNode(fileNode: FileNode) {
        fileNode.lines.forEach(line => this.visitLineNode(line));
    }

    private visitLineNode(lineNode: LineNode) {
        if (lineNode.label)
            this.defineLabel(lineNode.label, this.isSetCommand(lineNode.command));
        if (lineNode.command)
            this.visitCommandNode(lineNode.command);
    }

    private defineLabel(labelNode: LabelNode, asVariable: boolean) {
        if (labelNode.name.type == NodeType.DynamicLabel) return; // ignore it
        const name = labelNode.name.name;
        if (ALIASES.has(name)) return;
        const lablelObject = this.getLabelObjectByName(name);
        lablelObject.definitions.push(labelNode.name);
        if (asVariable)
            lablelObject.definedAsVariable = true;
        else
            lablelObject.definedAsConstant = true;
    }

    private isSetCommand(commandNode: AllComandNode | null): boolean {
        if (commandNode && commandNode.type === NodeType.Command) {
            return commandNode.name.name.toUpperCase() === SET;
        }
        return false;
    }

    private getLabelObjectByName(name: string): LabelObject {
        const labelsMap = name.startsWith(LOCAL_LABEL_PREFIX) ? this.localLabels[this.localLabels.length - 1] : this.globalLabels;
        let label = labelsMap.get(name);
        if (!label) {
            label = {
                name,
                definedAsConstant: false,
                definedAsVariable: false,
                definitions: [],
                usages: []
            };
            labelsMap.set(name, label);
        }
        return label;
    }

    private visitCommandNode(commandNode: AllComandNode) {
        switch (commandNode.type) {
            case NodeType.IfDirective:
                this.visitIfDirectiveNode(commandNode);
                break;
            case NodeType.RepeatDirective:
                this.visitRepeastDirectiveNode(commandNode);
                break;
            case NodeType.MacroDirective:
                this.visitMacroDirectiveNode(commandNode);
                break;
            case NodeType.Command:
                this.visitGeneralCommandNode(commandNode);
                break;
        }
    }

    private visitIfDirectiveNode(commandNode: IfDirectiveNode) {
        this.visitExpression(commandNode.condition);
        commandNode.thenBody.forEach(line => this.visitLineNode(line));
        // In case when the label is defined in else branch too.
        const tmpGlobalLabels = this.globalLabels;
        this.globalLabels = new Map();
        commandNode.elseBody.forEach(line => this.visitLineNode(line));
        this.globalLabels = tmpGlobalLabels;
    }

    private visitRepeastDirectiveNode(commandNode: RepeatDirectiveNode) {
        this.visitExpression(commandNode.expression);
        commandNode.body.forEach(line => this.visitLineNode(line));
    }

    private visitMacroDirectiveNode(commandNode: MacroDirectiveNode) {
        const name = unifyCommandName(commandNode.name.name);
        const macros = this.getMacrosByName(name);
        macros.definitions.push(commandNode.name);
        this.macrosCalls.addMacrosDefinition(name, commandNode.body);
        this.createSubroutineContext();
    }

    private visitGeneralCommandNode(commandNode: CommandNode) {
        switch (unifyCommandName(commandNode.name.name.toUpperCase())) {
            case SUBROUTINE:
                this.createSubroutineContext();
                break;
            case INCLUDE:
                this.handleIncludeCommand(commandNode);
                break;
            case INCBIN:
                this.handleIncludeBinCommand(commandNode);
                break;
            case INCDIR:
                this.handleIncludeDirCommand(commandNode);
                break;
            case LIST:
                this.handleListCommand(commandNode);
                break;
            case SEG:
            case SETSTR:
                // Just ignore it
                break;
            default:
                this.handleOtherCommand(commandNode);
                break;
        }
    }

    private createSubroutineContext() {
        this.localLabels.push(new Map());
    }

    private handleIncludeCommand(commandNode: CommandNode) {
        const fileNameNode = commandNode.args[0].value;
        const fileUri = this.findFileUri(this.extractFineName(fileNameNode));
        if (fileUri) {
            if (this.currentlyIncludedStack.has(fileUri)) {
                this.errors.push(constructError(MSG.CIRCULAR_INCLUDE, fileNameNode));
            } else {
                this.usedFiles.add(fileUri);
                this.currentlyIncludedStack.add(fileUri);
                this.visitFile(fileUri);
                this.currentlyIncludedStack.delete(fileUri);
            }
        } else
            this.errors.push(constructError(MSG.FILE_NOT_RESOLVABLE, fileNameNode));
    }

    private handleIncludeBinCommand(commandNode: CommandNode) {
        const fileNameNode = commandNode.args[0].value;
        const fileUri = this.findFileUri(this.extractFineName(fileNameNode));
        if (!fileUri)
            this.errors.push(constructError(MSG.FILE_NOT_RESOLVABLE, fileNameNode));
    }

    private handleIncludeDirCommand(commandNode: CommandNode) {
        const dirNameNode = commandNode.args[0].value;
        const dirName = this.extractFineName(dirNameNode);
        this.includeFolders.add(dirName);
        if (!isExists(joinUri(this.folderUri, dirName)))
            this.errors.push(constructWarning(MSG.FILE_NOT_RESOLVABLE, dirNameNode));
    }

    private extractFineName(expressionNode: ExpressionNode): string {
        if (expressionNode.type == NodeType.StringLiteral)
            return expressionNode.text;
        if (expressionNode.type == NodeType.Identifier)
            return expressionNode.name;
        throw new Error("Error in include parsing");
    }

    private handleListCommand(commandNode: CommandNode) {
        if (this.isListArgIncorrect(commandNode.args))
            this.errors.push(constructError(MSG.LIST_ARGS, commandNode));
    }

    private isListArgIncorrect(args: ArgumentNode[]): boolean {
        if (args.length != 1) return false;
        const arg = args[0].value;
        if (arg.type != NodeType.Identifier) return false;
        return ! new Set<string>(['ON', 'OFF']).has(arg.name.toUpperCase());
    }

    private handleOtherCommand(commandNode: CommandNode) {
        const name = unifyCommandName(commandNode.name.name);
        if (NAMES.has(name) || operations[name])
            for (const arg of commandNode.args)
                this.visitExpression(arg.value);
        else {
            this.getMacrosByName(name).usages.push(commandNode.name);
            this.macrosCalls.addMacrosUsage(commandNode);
        }
    }

    private visitExpression(node: ExpressionNode) {
        switch (node.type) {
            case NodeType.Identifier:
                this.visitIdentifier(node);
                break;
            case NodeType.UnaryOperator:
                this.visitExpression(node.operand);
                break;
            case NodeType.BinaryOperator:
                this.visitExpression(node.left);
                this.visitExpression(node.right);
                break;
            case NodeType.Brackets:
                this.visitExpression(node.value);
                break;
        }
    }

    private visitIdentifier(node: IdentifierNode) {
        const name = node.name;
        if (ALIASES.has(name)) return;
        const lableObject = this.getLabelObjectByName(name);
        lableObject.usages.push(node);
    }

    private findFileUri(name: string): string | undefined {
        let fileUri = joinUri(this.folderUri, name);
        if (isExists(fileUri)) return fileUri;
        for (const folder of this.includeFolders) {
            fileUri = joinUri(this.folderUri, folder, name);
            if (isExists(fileUri)) return fileUri;
        }
    }

    private getMacrosByName(name: UnifiedCommandName): MacrosObject {
        let macros = this.macroses.get(name);
        if (!macros) {
            macros = {
                name,
                definitions: [],
                usages: [],
            };
            this.macroses.set(name, macros);
        }
        return macros;
    }
}

class MacrosCalls {
    constructor(private parsedFiles: ParsedFiles, private uri: string) {}

    private macrosDefinitions = new Map<UnifiedCommandName, string>();
    private macrosUsages: CommandNode[] = [];

    public addMacrosDefinition(name: UnifiedCommandName, text: string) {
        this.macrosDefinitions.set(name, text);
    }

    public addMacrosUsage(commandNode: CommandNode) {
        this.macrosUsages.push(commandNode);
    }

    public getMacroResult(): MacroResult {
        const result: MacroResult = {
            labels: new Map(),
            errors: []
        };
        for (const command of this.macrosUsages) {
            const macroResult = this.getGlobalVariablesFromCommand(command);
            result.labels = mergeLabelsMap(result.labels, macroResult.labels);
            result.errors.push(...macroResult.errors);
        }
        return result;
    }

    private getGlobalVariablesFromCommand(commandNode: CommandNode): MacroResult {
        const code = this.preprocMacroCall(commandNode);
        const fileRoot = parseText(commandNode.location.uri, code);
        if (fileRoot.errors.length != 0)
            return {
                labels: new Map(),
                errors: [constructError(MSG.BAD_MACRO_CALL, commandNode)]
            };
        const program = new Program(this.parsedFiles, this.uri);
        program.visitFileNode(fileRoot.ast);
        const result: MacroResult = {
            labels: program.globalLabels,
            errors: []
        };
        if (program.errors.length != 0)
            result.errors = [constructError(MSG.BAD_MACRO_CALL, commandNode)];
        for (const label of result.labels.values()) {
            if (label.definitions.length != 0)
                label.definitions = [commandNode];
            if (label.usages.length != 0)
                label.usages = [commandNode];
        }
        return result;
    }

    
    private preprocMacroCall(commandNode: CommandNode): string {
        let result = this.macrosDefinitions.get(unifyCommandName(commandNode.name.name));
        if (!result) return '';
        const args = this.extractArgs(commandNode);
        for (let i=0; i<args.length; i++) {
            const searchString = `{${i+1}}`;
            result = result?.replaceAll(searchString, args[i]);
        }
        return result;
    }

    private extractArgs(commandNode: CommandNode): string[] {
        return commandNode.args.map(this.extractArg);
    }

    private extractArg(argumentNode: ArgumentNode): string {
        const value = argumentNode.value;
        if (value.type == NodeType.Identifier) return value.name;
        // Instead of calculating real value because it's not improtant for error checking
        return '1';
    }
}

type MacroResult = {
    labels: LabelsByName,
    errors: DiagnosticWithURI[]
}
