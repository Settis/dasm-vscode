import { CommandNameNode, LabelNode, LiteralNode, Node, ProgramNode, RelatedContext, RelatedObject } from "../ast/ast";
import { SUBROUTINE } from "../dasm/directives";

export function assembleProgram(program: ProgramNode) {
    new Assembler(program).processIt();
}

const LOCAL_LABEL_PREFIX = '.';

class Assembler {
    private labels: LabelNode[] = [];
    private literals: LiteralNode[] = [];
    private localLabes: {labels: LabelNode[], literals: LiteralNode[]}[] = [{
        labels: [],
        literals: []
    }];
    constructor(readonly program: ProgramNode) { }

    public processIt() {
        this.visitNode(this.program);
        this.processLocalLabels();
        processLabels(this.program.labels, this.labels);
        processLiterals(this.program.labels, this.literals);
    }

    private visitNode(node: Node) {
        this.registerNode(node);
        for (const child of node.children)
            this.visitNode(child);
    }

    private registerNode(node: Node) {
        switch (node.type) {
            case "Label":
                this.registerLabel(node);
                break;
            case "Literal":
                this.registerLiteral(node);
                break;
            case "CommandName":
                this.registerCommand(node);
                break;
            default:
                break;
        }
    }

    private registerLabel(node: LabelNode) {
        if (node.name.startsWith(LOCAL_LABEL_PREFIX)) {
            this.getLocalLabelsContext().labels.push(node);
        } else {
            this.labels.push(node);
        }
    }

    private registerLiteral(node: LiteralNode) {
        if (node.text.startsWith(LOCAL_LABEL_PREFIX)) {
            this.getLocalLabelsContext().literals.push(node);
        } else {
            this.literals.push(node);
        }
    }

    private getLocalLabelsContext() {
        return this.localLabes[this.localLabes.length - 1];
    }

    private registerCommand(node: CommandNameNode) {
        const nameInUpperCase = node.name.toUpperCase();
        if (nameInUpperCase === SUBROUTINE) {
            this.localLabes.push({
                labels: [],
                literals: []
            });
        }
    }

    private processLocalLabels() {
        for (const context of this.localLabes) {
            const relatedContext: RelatedContext = {};
            processLabels(relatedContext, context.labels);
            processLiterals(relatedContext, context.literals);
            this.program.localLabels.push(relatedContext);
        }
    }
}

function processLabels(context: RelatedContext, labels: LabelNode[]) {
    for (const label of labels) {
        const relatedLabel = getRelatedObject(context, label.name);
        label.relatedObject = relatedLabel;
        relatedLabel.definitions.push(label);
    }
}

function processLiterals(context: RelatedContext, literals: LiteralNode[]) {
    for (const literal of literals) {
        const relatedLabel = getRelatedObject(context, literal.text);
        literal.relatedObject = relatedLabel;
        relatedLabel.usages.push(literal);
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