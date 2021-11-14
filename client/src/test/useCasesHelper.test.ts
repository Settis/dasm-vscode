import { UseCase } from "./useCasesHelper";
import * as assert from 'assert';


describe('Use case helper', () => {
    it('works', () => {
        const action = {
            type: 'Error',
            message: 'Some'
        } as const;
        const useCase = new UseCase("name", {
            text: 
`foo bar
ba{zz|asd} {other|asd} {|asd}
qwe{r|asd}`,
            actions: {asd: action}
        });
        assert.strictEqual(useCase.getFixtureContent(), 
`foo bar
bazz other 
qwer`);
        assert.deepStrictEqual(useCase.getAnnotations(), [{
                action: action,
                name: 'asd',
                range: {line: 1, startChar: 2, length: 2}
            }, {
                action: action,
                name: 'asd',
                range: {line: 1, startChar: 5, length: 5}
            }, {
                action: action,
                name: 'asd',
                range: {line: 1, startChar: 11, length: 0}
            }, {
                action: action,
                name: 'asd',
                range: {line: 2, startChar: 3, length: 1}
            }
        ]);
    });

    it("Works with nested brackets", () => {
        const action = {
            type: 'Error',
            message: 'Some'
        } as const;
        const useCase = new UseCase("name", {
            text: '{fo{o|a}|b} {bar|c}',
            actions: {
                a: action,
                b: action,
                c: action
            }
        });
        assert.strictEqual(useCase.getFixtureContent(), 'foo bar');
        assert.deepStrictEqual(useCase.getAnnotations(), [{
                action: action,
                name: 'a',
                range: {line: 0, startChar: 2, length: 1}
            }, {
                action: action,
                name: 'b',
                range: {line: 0, startChar: 0, length: 3}
            }, {
                action: action,
                name: 'c',
                range: {line: 0, startChar: 4, length: 3}
            }
        ]);
    });

    it("Works with brackets", () => {
        const action = {
            type: 'Error',
            message: 'Some'
        } as const;
        const useCase = new UseCase("name", {
            text: '{fo{o|a}} {bar|c}',
            actions: {
                a: action,
                c: action
            }
        });
        assert.strictEqual(useCase.getFixtureContent(), '{foo} bar');
        assert.deepStrictEqual(useCase.getAnnotations(), [{
                action: action,
                name: 'a',
                range: {line: 0, startChar: 3, length: 1}
            }, {
                action: action,
                name: 'c',
                range: {line: 0, startChar: 6, length: 3}
            }
        ]);
    });

    it("several tags on the same text", () => {
        const action = {
            type: 'Error',
            message: 'Some'
        } as const;
        const useCase = new UseCase("name", {
            text: '{foo|a,b} bar',
            actions: {
                a: action,
                b: action
            }
        });
        assert.strictEqual(useCase.getFixtureContent(), 'foo bar');
        assert.deepStrictEqual(useCase.getAnnotations(), [{
                action: action,
                name: 'a',
                range: {line: 0, startChar: 0, length: 3}
            }, {
                action: action,
                name: 'b',
                range: {line: 0, startChar: 0, length: 3}
            }
        ]);
    });
});