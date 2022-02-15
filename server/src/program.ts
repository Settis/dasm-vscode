import { isArguments } from "./ast/astUtil";
import { RelatedContext, Node, NodeType, LabelNode, LiteralNode, CommandNameNode, RelatedObject, StringLiteralNode } from "./ast/nodes";
import { INCBIN, INCDIR, INCLUDE, SUBROUTINE } from "./dasm/directives";
import { isExists } from "./localFiles";
import { MSG } from "./messages";
import { ParsedFiles } from "./parsedFiles";
import { constructError, constructWarning, DiagnosticWithURI } from "./validators/util";

const LOCAL_LABEL_PREFIX = '.';

export class Program {
    constructor(private parsedFiles: ParsedFiles, private uri: string) {
        this.folderUri = uri.replace(/[^/]*$/, "");
    }

    public labels: RelatedContext = {};
    public localLabels: RelatedContext[] = [{}];
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
        if (ast) this.visitNode(ast);
    }

    private visitNode(node: Node) {
        switch (node.type) {
            case NodeType.Label:
                this.visitLabel(node);
                break;
            case NodeType.Literal:
                this.visitLiteral(node);
                break;
            case NodeType.CommandName:
                this.visitCommandName(node);
                break;
            default:
                break;
        }
        for (const child of node.children)
            this.visitNode(child);
    }

    private visitLabel(node: LabelNode) {
        const relatedObject = this.getRelatedObject(node.name);
        relatedObject.definitions.push(node);
        node.relatedObject = relatedObject;
    }

    private visitLiteral(node: LiteralNode) {
        const relatedObject = this.getRelatedObject(node.text);
        relatedObject.usages.push(node);
        node.relatedObject = relatedObject;
    }

    private visitCommandName(node: CommandNameNode) {
        switch (node.name.toUpperCase()) {
            case SUBROUTINE:
                this.localLabels.push({});
                break;
            case INCLUDE:
                this.handleIncludeCommand(node);
                break;
            case INCBIN:
                this.handleIncludeBinCommand(node);
                break;
            case INCDIR:
                this.handleIncludeDirCommand(node);
                break;
            default:
                break;
        }
    }

    private getRelatedObject(name: string): RelatedObject {
        if (name.startsWith(LOCAL_LABEL_PREFIX))
            return getRelatedObject(this.localLabels[this.localLabels.length - 1], name);
        else 
            return getRelatedObject(this.labels, name);
    }

    private handleIncludeCommand(node: CommandNameNode) {
        const fileNameNode = this.getRequiredStringArg(node);
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

    private handleIncludeBinCommand(node: CommandNameNode) {
        const fileNameNode = this.getRequiredStringArg(node);
        if (!fileNameNode) return;
        const fileUri = this.findFileUri(fileNameNode.text);
        if (!fileUri)
            this.errors.push(constructError(MSG.FILE_NOT_RESOLVABLE, fileNameNode));
    }

    private handleIncludeDirCommand(node: CommandNameNode) {
        const dirNameNode = this.getRequiredStringArg(node);
        if (!dirNameNode) return;
        this.includeFolders.add(dirNameNode.text);
        if (!isExists(this.folderUri + dirNameNode.text))
            this.errors.push(constructWarning(MSG.FILE_NOT_RESOLVABLE, dirNameNode));
    }

    private getRequiredStringArg(node: CommandNameNode): StringLiteralNode | undefined {
        const commandNode = node.parent;
        if (!commandNode) {
            this.errors.push(constructError(MSG.INTERNAL_ERROR, node));
            return;
        }
        const arg0 = commandNode.children.find(isArguments)?.children[0];
        if (arg0?.type === NodeType.StringLiteral) {
            if (arg0.text.length === 0) {
                this.errors.push(constructError(MSG.EMPTY_STRING, arg0));
                return;
            }
            return arg0;
        }
        this.errors.push(constructError(MSG.STRING_LITERAL_EXPECTED, commandNode));
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

function getRelatedObject(context: RelatedContext, name: string): RelatedObject {
    let result = context[name];
    if (result) return result;
    result = {
        definitions: [],
        usages: []
    };
    context[name] = result;
    return result;
}