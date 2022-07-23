import { INCBIN, INCDIR, INCLUDE, LIST, NAMES, SEG, SET, SUBROUTINE } from "./dasm/directives";
import { isExists } from "./localFiles";
import { MSG } from "./messages";
import { ParsedFiles } from "./parsedFiles";
import { AddressMode, AllComandNode, ArgumentNode, CommandNode, ExpressionNode, FileNode, IdentifierNode, IfDirectiveNode, LabelNode, LineNode, MacroDirectiveNode, NodeType, RepeatDirectiveNode, StringLiteralNode } from "./parser/ast/nodes";
import { LabelsByName, LabelObject, ALIASES } from "./parser/ast/labels";
import { constructError, constructWarning, DiagnosticWithURI } from "./validators/util";

const LOCAL_LABEL_PREFIX = '.';

export class Program {
    constructor(private parsedFiles: ParsedFiles, private uri: string) {
        this.folderUri = uri.replace(/[^/]*$/, "");
    }

    public globalLabels: LabelsByName = new Map();
    public localLabels: LabelsByName[] = [new Map()];
    private folderUri: string;
    private includeFolders = new Set<string>();
    public errors: DiagnosticWithURI[] = [];
    public usedFiles = new Set<string>();
    private currentlyIncludedStack = new Set<string>();

    public assemble() {
        this.visitFile(this.uri);
    }

    private visitFile(uri: string) {
        const ast = this.parsedFiles.getFileAst(uri);
        if (ast) this.visitFileNode(ast);
    }

    private visitFileNode(fileNode: FileNode) {
        fileNode.lines.forEach(line => this.visitLineNode(line));
    }

    private visitLineNode(lineNode: LineNode) {
        if (lineNode.label)
            this.defineLabel(lineNode.label, this.isSetCommand(lineNode.command));
        if (lineNode.command)
            this.visitCommandNode(lineNode.command);
    }

    private defineLabel(labelNode: LabelNode, asVariable: boolean) {
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
        commandNode.elseBody.forEach(line => this.visitLineNode(line));
    }

    private visitRepeastDirectiveNode(commandNode: RepeatDirectiveNode) {
        this.visitExpression(commandNode.expression);
        commandNode.body.forEach(line => this.visitLineNode(line));
    }

    private visitMacroDirectiveNode(commandNode: MacroDirectiveNode) {
        this.createSubroutineContext();
        commandNode.body.forEach(line => this.visitLineNode(line));
        this.createSubroutineContext();
    }

    private visitGeneralCommandNode(commandNode: CommandNode) {
        switch (commandNode.name.name.toUpperCase()) {
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
        const fileNameNode = this.getRequiredStringArg(commandNode);
        if (!fileNameNode) return;
        const fileUri = this.findFileUri(fileNameNode.text);
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
        const fileNameNode = this.getRequiredStringArg(commandNode);
        if (!fileNameNode) return;
        const fileUri = this.findFileUri(fileNameNode.text);
        if (!fileUri)
            this.errors.push(constructError(MSG.FILE_NOT_RESOLVABLE, fileNameNode));
    }

    private handleIncludeDirCommand(commandNode: CommandNode) {
        const dirNameNode = this.getRequiredStringArg(commandNode);
        if (!dirNameNode) return;
        this.includeFolders.add(dirNameNode.text);
        if (!isExists(this.folderUri + dirNameNode.text))
            this.errors.push(constructWarning(MSG.FILE_NOT_RESOLVABLE, dirNameNode));
    }

    private getRequiredStringArg(commandNode: CommandNode): StringLiteralNode | undefined {
        if (commandNode.args.length != 1) {
            this.errors.push(constructError(MSG.STRING_LITERAL_EXPECTED, commandNode));
            return;
        }
        const arg0 = commandNode.args[0];
        if (arg0.addressMode !== AddressMode.None) {
            this.errors.push(constructError(MSG.STRING_LITERAL_EXPECTED, arg0));
            return;
        }
        const argValue = arg0.value;
        if (argValue.type !== NodeType.StringLiteral) {
            this.errors.push(constructError(MSG.STRING_LITERAL_EXPECTED, argValue));
            return;
        }
        if ((argValue as StringLiteralNode).text.length === 0) {
            this.errors.push(constructError(MSG.EMPTY_STRING, arg0));
            return;
        }
        return argValue as StringLiteralNode;
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
        if (NAMES.has(commandNode.name.name.toUpperCase()))
            for (const arg of commandNode.args)
                this.visitExpression(arg.value);
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
        let fileUri = this.folderUri + name;
        if (isExists(fileUri)) return fileUri;
        for (const folder of this.includeFolders) {
            fileUri = this.folderUri + folder + '/' + name;
            if (isExists(fileUri)) return fileUri;
        }
    }
}
