import * as assert from 'assert';
import AsmLine from '../asmLine';

describe('AsmLine can parse line:', () => {
	it(';   EXAMPLE.ASM', () => {
		const line = new AsmLine(';   EXAMPLE.ASM');
		assert.deepStrictEqual(line.label, undefined);
		assert.deepStrictEqual(line.command, undefined);
		assert.deepStrictEqual(line.arguments, []);
		assert.deepStrictEqual(line.comment, {
			text: 'EXAMPLE.ASM',
			range: {
				start: 4,
				end: 15
			}
		});
	});
	it(';', () => {
		const line = new AsmLine(';');
		assert.deepStrictEqual(line.label, undefined);
		assert.deepStrictEqual(line.command, undefined);
		assert.deepStrictEqual(line.arguments, []);
		assert.deepStrictEqual(line.comment, undefined);
	});
	it('', () => {
		const line = new AsmLine('');
		assert.deepStrictEqual(line.label, undefined);
		assert.deepStrictEqual(line.command, undefined);
		assert.deepStrictEqual(line.arguments, []);
		assert.deepStrictEqual(line.comment, undefined);
	});
	it('	    processor	6502', () => {
		const line = new AsmLine('	    processor	6502');
		assert.deepStrictEqual(line.label, undefined);
		assert.deepStrictEqual(line.command, {
			text: 'processor',
			range: {
				start: 5,
				end: 14
			}
		});
		assert.deepStrictEqual(line.arguments, [
			{
				text: '6502',
				range: {
					start: 15,
					end: 19
				}
			}
		]);
		assert.deepStrictEqual(line.comment, undefined);
	});
	it('FOO	    equ %00000000', () => {
		const line = new AsmLine('FOO	    equ %00000000');
		assert.deepStrictEqual(line.label, {
			text: 'FOO',
			range: {
				start: 0,
				end: 3
			}
		});
		assert.deepStrictEqual(line.command, {
			text: 'equ',
			range: {
				start: 8,
				end: 11
			}
		});
		assert.deepStrictEqual(line.arguments, [
			{
				text: '%00000000',
				range: {
					start: 12,
					end: 21
				}
			}
		]);
		assert.deepStrictEqual(line.comment, undefined);
	});
	it('Label	    equ %0000		    ;Comment', () => {
		const line = new AsmLine('Label	    equ %0000		    ;Comment');
		assert.deepStrictEqual(line.label, {
			text: 'Label',
			range: {
				start: 0,
				end: 5
			}
		});
		assert.deepStrictEqual(line.command, {
			text: 'equ',
			range: {
				start: 10,
				end: 13
			}
		});
		assert.deepStrictEqual(line.arguments, [
			{
				text: '%0000',
				range: {
					start: 14,
					end: 19
				}
			}
		]);
		assert.deepStrictEqual(line.comment, {
			text: 'Comment',
			range: {
				start: 26,
				end: 33
			}
		});
	});
	it('	    sei 		;disable interrupts ', () => {
		const line = new AsmLine('	    sei 		;disable interrupts ');
		assert.deepStrictEqual(line.label, undefined);
		assert.deepStrictEqual(line.command, {
			text: 'sei',
			range: {
				start: 5,
				end: 8
			}
		});
		assert.deepStrictEqual(line.arguments, []);
		assert.deepStrictEqual(line.comment, {
			text: 'disable interrupts',
			range: {
				start: 12,
				end: 30
			}
		});
	});
	it('	    ldx     #$FF	;reset stack', () => {
		const line = new AsmLine('	    ldx     #$FF	;reset stack');
		assert.deepStrictEqual(line.label, undefined);
		assert.deepStrictEqual(line.command, {
			text: 'ldx',
			range: {
				start: 5,
				end: 8
			}
		});
		assert.deepStrictEqual(line.arguments, [
			{
				text: "#$FF",
				range: {
					start: 13,
					end: 17
				}
			}
		]);
		assert.deepStrictEqual(line.comment, {
			text: 'reset stack',
			range: {
				start: 19,
				end: 30
			}
		});
	});
	it('        macrosCall #$12 value', () => {
		const line = new AsmLine('        macrosCall #$12 value');
		assert.deepStrictEqual(line.label, undefined);
		assert.deepStrictEqual(line.command, {
			text: 'macrosCall',
			range: {
				start: 8,
				end: 18
			}
		});
		assert.deepStrictEqual(line.arguments, [
			{
				text: '#$12',
				range: {
					start: 19,
					end: 23
				}
			}, {
				text: 'value',
				range: {
					start: 24,
					end: 29
				}
			}
		]);
		assert.deepStrictEqual(line.comment, undefined);
	});
	it('FOO   FOO FOO   FOO  ; FOO   ', () => {
		const line = new AsmLine('FOO   FOO FOO   FOO  ; FOO   ');
		assert.deepStrictEqual(line.label, {
			text: 'FOO',
			range: {
				start: 0,
				end: 3
			}
		});
		assert.deepStrictEqual(line.command, {
			text: 'FOO',
			range: {
				start: 6,
				end: 9
			}
		});
		assert.deepStrictEqual(line.arguments, [
			{
				text: 'FOO',
				range: {
					start: 10,
					end: 13
				}
			}, {
				text: 'FOO',
				range: {
					start: 16,
					end: 19
				}
			}
		]);
		assert.deepStrictEqual(line.comment, {
			text: 'FOO',
			range: {
				start: 23,
				end: 26
			}
		});
	});
});