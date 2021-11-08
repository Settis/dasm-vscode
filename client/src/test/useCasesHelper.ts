import fs = require("fs");
import path = require("path");
import yaml = require('js-yaml');

export const projectRootFolder = path.resolve(__dirname, '../../../');
export const e2eTestsFolder = path.resolve(projectRootFolder, 'e2eTests');
export const useCasesFolder = path.resolve(e2eTestsFolder, 'useCases');
export const fixturesFolder = path.resolve(e2eTestsFolder, 'testFixture');

const annotationPattern = /\{(.*?)\|(.*?)\}/g;

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
        return this.description.text.replace(annotationPattern, '$1');
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
        let annotationMatch: RegExpExecArray | null;
        for (const textLine of this.description.text.split('\n')) {
            let offset = 0;
            while ((annotationMatch = annotationPattern.exec(textLine))) {
                const actionName = annotationMatch[2];
                result.push({
                    name: actionName,
                    range: {
                        line: lineNumber, 
                        startChar: annotationMatch.index - offset, 
                        length: annotationMatch[1].length
                    },
                    action: this.description.actions[actionName]
                });
                // offset for "{" "|" "}" and annotation name
                offset += 3 + actionName.length;
            }
            lineNumber++;
        }
        return result;
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
