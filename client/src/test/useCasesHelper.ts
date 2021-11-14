import fs = require("fs");
import path = require("path");
import yaml = require('js-yaml');

export const projectRootFolder = path.resolve(__dirname, '../../../');
export const e2eTestsFolder = path.resolve(projectRootFolder, 'e2eTests');
export const useCasesFolder = path.resolve(e2eTestsFolder, 'useCases');
export const fixturesFolder = path.resolve(e2eTestsFolder, 'testFixture');

const annotationPattern = /\{([^{]*?)\|(.*?)\}/g;

export function recreateFixtureFolder() {
    fs.rmSync(fixturesFolder, { force: true, recursive: true });
    fs.mkdirSync(fixturesFolder);
}

export function readUseCases() {
    return fs.readdirSync(useCasesFolder)
        .filter((name) => { return name.endsWith('.yaml'); })
        .map((name) => { return constructUseCase(name); });
}

export class UseCase {
    constructor(readonly name: string, readonly description: UseCaseDescription) {}

    getFixtureContent() {
        let prev = this.description.text;
        let current = prev;
        do {
            prev = current;
            current = prev.replace(annotationPattern, '$1');
        } while (prev !== current);
        return current;
    }

    getUseCaseFolder() {
        return path.resolve(fixturesFolder, this.name);
    }

    getMainFile() {
        return path.resolve(this.getUseCaseFolder(), 'main.asm');
    }

    getAnnotations() {
        const result: UseCaseAnnotation[] = [];
        let lineNumber = 0;
        for (const textLine of this.description.text.split('\n')) {
            const useCaseLine = new UseCaseLine(textLine, lineNumber, this.description);
            result.push(...useCaseLine.getAnnotations());
            lineNumber++;
        }
        return result;
    }
}

class UseCaseLine {
    offset = 0;
    position = 0;

    constructor(readonly line: string, readonly lineNumber: number, readonly description: UseCaseDescription) { }

    getAnnotations() {
        const result: UseCaseAnnotation[] = [];
        do {
            if (this.getCurrentChar() === '{')
                result.push(...this.extractTags());
            this.position++;
        } while (this.position < this.line.length);
        return result;
    }

    extractTags() {
        const result: UseCaseAnnotation[] = [];
        const start = this.position - this.offset;
        let pipe = -1;
        do {
            this.position++;
            const char = this.getCurrentChar();
            if (char === '{')
                result.push(...this.extractTags());
            if (char === '|')
                pipe = this.position;
            if (char === '}') {
                if (pipe !== -1) {
                    const actionNames = this.line.substring(pipe + 1, this.position);
                    result.forEach(annotation => annotation.range.startChar--);
                    for (const actionName of actionNames.split(','))
                        result.push({
                            name: actionName,
                            range: {
                                line: this.lineNumber,
                                startChar: start,
                                length: pipe - start - this.offset - 1
                            },
                            action: this.description.actions[actionName]
                        });
                    // offset for "{" "|" "}" and annotation name
                    this.offset += 3 + actionNames.length;
                }
                return result;
            }
        } while (this.position < this.line.length);
        return result;
    }

    getCurrentChar() {
        return this.line.charAt(this.position);
    }
}

export function constructUseCase(fileName: string) {
    const name = fileName.substr(0, fileName.length - 5);
    const caseFileContent = fs.readFileSync(path.resolve(useCasesFolder, fileName), 'utf8');
    const description = yaml.load(caseFileContent) as UseCaseDescription;
    return new UseCase(name, description);
}

export type UseCaseAnnotation = {
    name: string,
    range: AnnotationRange,
    action: UseCaseAction
}

type AnnotationRange  = {
    line: number,
    startChar: number,
    length: number
}

type UseCaseDescription = {
    text: string,
    actions: { [actions: string]: UseCaseAction }
}

type UseCaseAction = ErrorAction

type ErrorAction = {
    type: 'Error',
    message: string,
    severity?: 'Error' | 'Warning' | 'Information' | 'Hint'
}
