import * as assert from 'assert';
import AsmLine from '../asmLine';

describe('AsmLine can parse line:', () => {
	it(';   EXAMPLE.ASM', () => {
		const line = new AsmLine(';   EXAMPLE.ASM')
		assert.deepStrictEqual(line.label, undefined)
		assert.deepStrictEqual(line.command, undefined)
		assert.deepStrictEqual(line.arguments, undefined)
		assert.deepStrictEqual(line.comment, {
			text: 'EXAMPLE.ASM',
			range: {
				start: 4,
				end: 15
			}
		})
	})
	it(';', () => {
		const line = new AsmLine(';')
		assert.deepStrictEqual(line.label, undefined)
		assert.deepStrictEqual(line.command, undefined)
		assert.deepStrictEqual(line.arguments, undefined)
		assert.deepStrictEqual(line.comment, {})
	})
	it('', () => {})
	it('	    processor	6502', () => {})
	it('FOO	    equ %00000000', () => {})
	it('Label	    equ %0000		    ;Comment', () => {})
	it('	    sei 		;disable interrupts', () => {})
	it('	    ldx     #$FF	;reset stack', () => {})
	it('        macrosCall #$12 value', () => {})
	it('FOO   FOO FOO   FOO  ; FOO   ', () => {})
})