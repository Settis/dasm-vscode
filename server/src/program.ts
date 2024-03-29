import { INCBIN, INCDIR, INCLUDE, LIST, NAMES, REND, RORG, SEG, SET, SETSTR, SUBROUTINE } from "./dasm/directives";
import { getFolder, isFileExists, isDirExists, joinUri, unifyUri } from "./localFiles";
import { MSG } from "./messages";
import { ParsedFiles } from "./parsedFiles";
import { AllComandNode, ArgumentNode, AstNode, CommandNode, ExpressionNode, FileNode, IdentifierNode, IfDirectiveNode, IfDirectiveType, LabelNode, LineNode, MacroDirectiveNode, NodeType, RepeatDirectiveNode } from "./parser/ast/nodes";
import { LabelsByName, LabelObject, ALIASES, mergeLabelsMap } from "./parser/ast/labels";
import { constructError, constructWarning, DiagnosticWithURI } from "./validators/util";
import { operations } from "./dasm/operations";
import { MacrosByName, MacrosObject } from "./parser/ast/macros";
import { UnifiedCommandName, unifyCommandName } from "./validators/asmCommandValidator";
import { parseText } from "./parser/ast/utils";
import { SegmentsByName } from "./parser/ast/segments";

const LOCAL_LABEL_PREFIX = '.';

export class Program {
    constructor(private parsedFiles: ParsedFiles, uri: string) {
        this.uri = unifyUri(uri);
        this.folderUri = getFolder(uri);
        this.macrosCalls = new MacrosCalls(parsedFiles, this.includeFolders, this.definedLabels, uri);
    }

    public uri: string;
    public globalLabels: LabelsByName = new Map();
    public definedLabels = new Set<string>();
    public localLabels: LabelsByName[] = [new Map()];
    public macroses: MacrosByName = new Map();
    public relocatableDirectives: CommandNode[] = [];
    public segments: SegmentsByName = new Map();
    private folderUri: string;
    public includeFolders = new Set<string>();
    public errors: DiagnosticWithURI[] = [];
    public usedFiles = new Set<string>();
    public includedFiles = new Map<AstNode, string>();
    private currentlyIncludedStack = new Set<string>();
    public macrosCalls: MacrosCalls;
    public dynamicLabelsPrefixes = new Set<string>();

    public assemble() {
        this.visitFile(this.uri);
        const macroResult = this.macrosCalls.getMacroResult();
        this.globalLabels = mergeLabelsMap(this.globalLabels, macroResult.labels);
        mergeCodeObjectMaps(this.macroses, macroResult.macroses);
        mergeCodeObjectMaps(this.segments, macroResult.segments);
        macroResult.dynamicLabelsPrefixes.forEach(it => this.dynamicLabelsPrefixes.add(it));
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
        if (labelNode.name.type == NodeType.DynamicLabel) {
            this.dynamicLabelsPrefixes.add(labelNode.name.identifiers[0].name);
            return;
        }
        const name = labelNode.name.name;
        if (ALIASES.has(name)) return;
        const lablelObject = this.getLabelObjectByName(name);
        lablelObject.definitions.push(labelNode.name);
        this.definedLabels.add(labelNode.name.name);
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
        const expr = commandNode.condition;
        switch (commandNode.ifType) {
            case IfDirectiveType.IfConst:
                if (expr.type != NodeType.Identifier) return;
                if (!this.definedLabels.has(expr.name)) return;
                break;
            case IfDirectiveType.IfNConst:
                if (expr.type != NodeType.Identifier) return;
                if (this.definedLabels.has(expr.name)) return;
                break;
            case IfDirectiveType.If:
                break;
        }
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
        switch (unifyCommandName(commandNode.name.name)) {
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
                this.handleSegmentCommand(commandNode);
                break;
            case SETSTR:
                // Just ignore it
                break;
            case RORG:
            case REND:
                this.relocatableDirectives.push(commandNode);
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
        const fileName = this.extractFineName(fileNameNode);
        if (!fileName) return;
        const fileUri = this.findFileUri(fileName);
        if (fileUri) {
            this.includedFiles.set(fileNameNode, fileUri);
            if (this.uri === fileUri || this.currentlyIncludedStack.has(fileUri)) {
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
        const fileName = this.extractFineName(fileNameNode);
        if (!fileName) return;
        const fileUri = this.findFileUri(fileName);
        if (!fileUri)
            this.errors.push(constructError(MSG.FILE_NOT_RESOLVABLE, fileNameNode));
    }

    private handleIncludeDirCommand(commandNode: CommandNode) {
        const dirNameNode = commandNode.args[0].value;
        const dirName = this.extractFineName(dirNameNode);
        if (!dirName) return;
        this.includeFolders.add(dirName);
        if (!isDirExists(joinUri(this.folderUri, dirName)))
            this.errors.push(constructWarning(MSG.DIR_NOT_RESOLVABLE, dirNameNode));
    }

    private extractFineName(expressionNode: ExpressionNode): string | undefined {
        let name;
        if (expressionNode.type == NodeType.StringLiteral)
            name = expressionNode.text;
        if (expressionNode.type == NodeType.Identifier)
            name = expressionNode.name;
        if (name)
            return name;
        else {
            this.errors.push(constructError(MSG.EMPTY_STRING, expressionNode));
        }
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

    private handleSegmentCommand(commandNode: CommandNode) {
        if (commandNode.args.length == 0) return;
        const arg = commandNode.args[0].value;
        if (arg.type != NodeType.Identifier) return;
        const knownSegment = this.segments.get(arg.name);
        if (knownSegment)
            knownSegment.usages.push(arg);
        else 
            this.segments.set(arg.name, {name: arg.name, definitions: [], usages: [arg]});
    }

    private handleOtherCommand(commandNode: CommandNode) {
        const name = unifyCommandName(commandNode.name.name);
        if (NAMES.has(name) || operations[name])
            for (const arg of commandNode.args)
                this.visitExpression(arg.value);
        else {
            this.getMacrosByName(name).usages.push(commandNode.name);
            for (const arg of commandNode.args)
                this.visitExpression(arg.value, true);
            this.macrosCalls.addMacrosUsage(commandNode);
        }
    }

    private visitExpression(node: ExpressionNode, optinalIdentifiers = false) {
        switch (node.type) {
            case NodeType.Identifier:
                this.visitIdentifier(node, optinalIdentifiers);
                break;
            case NodeType.UnaryOperator:
                this.visitExpression(node.operand, optinalIdentifiers);
                break;
            case NodeType.BinaryOperator:
                this.visitExpression(node.left, optinalIdentifiers);
                this.visitExpression(node.right, optinalIdentifiers);
                break;
            case NodeType.Brackets:
                this.visitExpression(node.value, optinalIdentifiers);
                break;
        }
    }

    private visitIdentifier(node: IdentifierNode, optinalIdentifiers = false) {
        const name = node.name;
        if (ALIASES.has(name)) return;
        if (optinalIdentifiers) {
            let labelObject = this.globalLabels.get(name);
            if (labelObject === undefined)
                labelObject = this.localLabels[this.localLabels.length - 1].get(name);
            if (labelObject)
                labelObject.usages.push(node);
        } else {
            const lableObject = this.getLabelObjectByName(name);
            lableObject.usages.push(node);
        }
    }

    private findFileUri(name: string): string | undefined {
        let fileUri = joinUri(this.folderUri, name);
        if (isFileExists(fileUri)) return fileUri;
        for (const folder of this.includeFolders) {
            fileUri = joinUri(this.folderUri, folder, name);
            if (isFileExists(fileUri)) return fileUri;
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
    constructor(private parsedFiles: ParsedFiles, 
        private includeFolders: Set<string>,
        private definedLabels: Set<string>,
        private uri: string) {}

    public macrosDefinitions = new Map<UnifiedCommandName, string>();
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
            dynamicLabelsPrefixes: new Set(),
            macroses: new Map(),
            segments: new Map(),
            errors: []
        };
        for (const command of this.macrosUsages) {
            const macroResult = this.getGlobalVariablesFromCommand(command);
            result.labels = mergeLabelsMap(result.labels, macroResult.labels);
            macroResult.dynamicLabelsPrefixes.forEach(it => result.dynamicLabelsPrefixes.add(it));
            result.errors.push(...macroResult.errors);
            mergeCodeObjectMaps(result.segments, macroResult.segments);
            mergeCodeObjectMaps(result.macroses, macroResult.macroses);
        }
        return result;
    }

    private getGlobalVariablesFromCommand(commandNode: CommandNode): MacroResult {
        const code = this.preprocMacroCall(commandNode);
        const fileRoot = parseText(commandNode.location.uri, code);
        if (fileRoot.errors.length != 0)
            return {
                labels: new Map(),
                dynamicLabelsPrefixes: new Set(),
                macroses: new Map(),
                segments: new Map(),
                errors: [constructError(MSG.BAD_MACRO_CALL, commandNode)]
            };
        const program = new Program(this.parsedFiles, this.uri);
        program.macrosCalls.macrosDefinitions = this.macrosDefinitions;
        program.includeFolders = this.includeFolders;
        program.definedLabels = this.definedLabels;
        program.visitFileNode(fileRoot.ast);
        const result: MacroResult = {
            labels: program.globalLabels,
            dynamicLabelsPrefixes: program.dynamicLabelsPrefixes,
            macroses: program.macroses,
            segments: program.segments,
            errors: []
        };
        const macroResult = program.macrosCalls.getMacroResult();
        for (const [labelName, label] of macroResult.labels) {
            result.labels.set(labelName, label);
        }
        macroResult.dynamicLabelsPrefixes.forEach(it => result.dynamicLabelsPrefixes.add(it));
        if (program.errors.length != 0)
            result.errors = [constructError(MSG.BAD_MACRO_CALL, commandNode)];
        updateDefinitionAndUsages(result.labels, commandNode);
        updateDefinitionAndUsages(result.macroses, commandNode);
        updateDefinitionAndUsages(result.segments, commandNode);
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
    dynamicLabelsPrefixes: Set<string>,
    macroses: MacrosByName,
    segments: SegmentsByName,
    errors: DiagnosticWithURI[]
}

type MapWithCodeObjects = Map<string, CodeObject>;

type CodeObject = {
    name: string,
    definitions: AstNode[],
    usages: AstNode[]
}

function updateDefinitionAndUsages(map: MapWithCodeObjects, commandNode: CommandNode) {
    for (const object of map.values()) {
        if (object.definitions.length != 0)
            object.definitions = [commandNode];
        if (object.usages.length != 0)
            object.usages = [commandNode];
    }
}

function mergeCodeObjectMaps(first: MapWithCodeObjects, second: MapWithCodeObjects) {
    for (const secondObject of second.values()) {
        const firstObject = first.get(secondObject.name);
        if (!firstObject) {
            first.set(secondObject.name, secondObject);
            continue;
        }
        firstObject.definitions.push(...secondObject.definitions);
        firstObject.usages.push(...secondObject.usages);
    }
}
