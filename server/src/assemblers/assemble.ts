import { LabelNode, LiteralNode, Node, NodeType, ProgramNode } from "../ast";
import { getNearestParentByType } from "../astUtil";

export function assembleProgram(program: ProgramNode) {
    new Assembler(program).processIt();
}

class Assembler {
    private labels: LabelNode[] = [];
    private literals: LiteralNode[] = [];
    constructor(readonly program: ProgramNode) { }

    public processIt() {
        this.visitNode(this.program);
        this.processLabels();
        this.processLiterals();
    }

    private visitNode(node: Node) {
        this.registerNode(node);
        for (const child of node.children)
            this.visitNode(child);
    }

    private registerNode(node: Node) {
        switch (node.type) {
            case "Label":
                this.labels.push(node);
                break;
            case "Literal":
                this.literals.push(node);
                break;
            default:
                break;
        }
    }

    private processLabels() {
        for (const label of this.labels) {
            const program = (getNearestParentByType(label, NodeType.Program) as ProgramNode | undefined);
            if (program) {
                const relatedLabel = program.labels[label.name] || {
                    definitions: [],
                    usages: []
                };
                label.relatedObject = relatedLabel;
                relatedLabel.definitions.push(label);
                program.labels[label.name] = relatedLabel;
            }
        }
    }

    private processLiterals() {
        for (const literal of this.literals) {
            const program = (getNearestParentByType(literal, NodeType.Program) as ProgramNode | undefined);
            if (program) {
                const relatedLabel = program.labels[literal.text] || {
                    definitions: [],
                    usages: []
                };
                literal.relatedObject = relatedLabel;
                relatedLabel.usages.push(literal);
                program.labels[literal.text] = relatedLabel;
            }
        }
    }
}
