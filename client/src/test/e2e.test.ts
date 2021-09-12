import { readUseCases, UseCaseAnnotation } from "./useCasesHelper";
import { constructRange, getDocUri, getErrors, getSeverityFor, openUseCaseFile, sleep } from './vscodeHelper';
import * as assert from 'assert';

const useCases = readUseCases();

suite('Description is valid for:', () => {
    for (const useCase of useCases) {
        test(useCase.name, () => {
            for (const annotation of useCase.getAnnotations()) {
                assert.ok(annotation.name in useCase.description.actions, `annotation ${annotation.name} not described`);
                const action = useCase.description.actions[annotation.name];
                switch (action.type) {
                    case 'Error':
                        assert.ok('message' in action, `Action ${annotation.name} has no message`);
                        break;
                
                    default:
                        assert.fail(`Unknown action type ${action.type}`);
                }
            }
        });
    }
});

for (const useCase of useCases) {
    suite(`Case: ${useCase.name}`, () => {
        const mainUri = getDocUri(useCase.getMainFile());
        const annotations = useCase.getAnnotations();

        suiteSetup(async () => { 
            await openUseCaseFile(mainUri); 
        });

        test("check errors", async () => {
            const expectedErrors = annotations.filter((it) => { return it.action.type == 'Error'; });
            const actualErrors = await getErrors(mainUri, expectedErrors.length);
            assert.strictEqual(actualErrors.length, expectedErrors.length, 'Errors count are not the same');
            expectedErrors.forEach((expectedError, i) => {
                const actualError = actualErrors[i];
                assert.strictEqual(actualError.message, expectedError.action.message, `Error ${expectedError.name} names`);
                assert.deepStrictEqual(actualError.range, getRange(expectedError), `Error ${expectedError.name} ranges`);
                assert.strictEqual(actualError.severity, getSeverityFor(expectedError.action.severity), `Error ${expectedError.name} severity`);
            });
        });

        test("check other", () => {
            // nothing to check
        });
    });
}

function getRange(useCaseAnnotation: UseCaseAnnotation) {
    const range = useCaseAnnotation.range;
    return constructRange(range.line, range.startChar, range.length);
}
