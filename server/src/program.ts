import { CommandNameNode, LabelNode, LiteralNode, Node, NodeType, RelatedContext, RelatedObject } from "./ast/ast";
import { SUBROUTINE } from "./dasm/directives";
import { ParsedFiles } from "./parsedFiles";

const LOCAL_LABEL_PREFIX = '.';

export class Program {
    constructor(private parsedFiles: ParsedFiles, private uri: string) {}

    public labels: RelatedContext = {};
    public localLabels: RelatedContext[] = [{}];

    public assemble() {
        this.visitFile(this.uri);
    }

    private visitFile(uri: string) {
        const ast = this.parsedFiles.getFileAst(uri);
        if (ast)
            this.visitNode(ast);
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
        const nameInUpperCase = node.name.toUpperCase();
        if (nameInUpperCase === SUBROUTINE)
            this.localLabels.push({});
    }

    private getRelatedObject(name: string): RelatedObject {
        if (name.startsWith(LOCAL_LABEL_PREFIX))
            return getRelatedObject(this.localLabels[this.localLabels.length - 1], name);
        else 
            return getRelatedObject(this.labels, name);
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