import * as assert from 'assert';
import parseAsmLine from '../dasm/asmLine';

describe('AsmLine can parse line:', () => {
	it(';   EXAMPLE.ASM', () => {
		assert.deepStrictEqual(parseAsmLine(';   EXAMPLE.ASM'), {
			label: undefined, 
			command: undefined,
			arguments: [],
			comment: {
				text: 'EXAMPLE.ASM',
				range: {
					start: 4,
					end: 15
				}
			}
		});
	});
	it(';', () => {
		assert.deepStrictEqual(parseAsmLine(';'), {
			label: undefined,
			command: undefined,
			arguments: [],
			comment: undefined
		});
	});
	it('', () => {
		assert.deepStrictEqual(parseAsmLine(''), {
			label: undefined,
			command: undefined,
			arguments: [],
			comment: undefined
		});
	});
	it('START', () => {
		assert.deepStrictEqual(parseAsmLine('START'), {
			label: {
				text: 'START',
				range: {
					start: 0,
					end: 5
				}
			},
			command: undefined,
			arguments: [],
			comment: undefined
		});
	});
	it('END   ; The end', () => {
		assert.deepStrictEqual(parseAsmLine('END   ; The end'), {
			label: {
				text: 'END',
				range: {
					start: 0,
					end: 3
				}
			},
			command: undefined,
			arguments: [],
			comment: {
				text: 'The end',
				range: {
					start: 8,
					end: 15
				}
			}
		});
	});
	it('	    processor	6502', () => {
		assert.deepStrictEqual(parseAsmLine('	    processor	6502'), {
			label: undefined,
			command: {
				text: 'processor',
				range: {
					start: 5,
					end: 14
				}
			},
			arguments: [
				{
					text: '6502',
					range: {
						start: 15,
						end: 19
					}
				}
			],
			comment: undefined
		});
	});
	it('FOO	    equ %00000000', () => {
		assert.deepStrictEqual(parseAsmLine('FOO	    equ %00000000'), {
			label: {
				text: 'FOO',
				range: {
					start: 0,
					end: 3
				}
			},
			command: {
				text: 'equ',
				range: {
					start: 8,
					end: 11
				}
			},
			arguments: [
				{
					text: '%00000000',
					range: {
						start: 12,
						end: 21
					}
				}
			],
			comment: undefined
		});
	});
	it('Label	    equ %0000		    ;Comment', () => {
		assert.deepStrictEqual(parseAsmLine('Label	    equ %0000		    ;Comment'), {
			label: {
				text: 'Label',
				range: {
					start: 0,
					end: 5
				}
			},
			command: {
				text: 'equ',
				range: {
					start: 10,
					end: 13
				}
			},
			arguments: [
				{
					text: '%0000',
					range: {
						start: 14,
						end: 19
					}
				}
			],
			comment: {
				text: 'Comment',
				range: {
					start: 26,
					end: 33
				}
			}
		});
	});
	it('	    sei 		;disable interrupts ', () => {
		assert.deepStrictEqual(parseAsmLine('	    sei 		;disable interrupts '), {
			label: undefined,
			command: {
				text: 'sei',
				range: {
					start: 5,
					end: 8
				}
			},
			arguments: [],
			comment: {
				text: 'disable interrupts',
				range: {
					start: 12,
					end: 30
				}
			}
		});
	});
	it('	    ldx     #$FF	;reset stack', () => {
		assert.deepStrictEqual(parseAsmLine('	    ldx     #$FF	;reset stack'), {
			label: undefined,
			command: {
				text: 'ldx',
				range: {
					start: 5,
					end: 8
				}
			},
			arguments: [
				{
					text: "#$FF",
					range: {
						start: 13,
						end: 17
					}
				}
			],
			comment: {
				text: 'reset stack',
				range: {
					start: 19,
					end: 30
				}
			}
		});
	});
	it('        macrosCall #$12 value', () => {
		assert.deepStrictEqual(parseAsmLine('        macrosCall #$12 value'), {
			label: undefined,
			command: {
				text: 'macrosCall',
				range: {
					start: 8,
					end: 18
				}
			}, 
			arguments: [
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
			],
			comment: undefined
		});
	});
	it('FOO   FOO FOO   FOO  ; FOO   ', () => {
		assert.deepStrictEqual(parseAsmLine('FOO   FOO FOO   FOO  ; FOO   '), {
			label: {
				text: 'FOO',
				range: {
					start: 0,
					end: 3
				}
			}, 
			command: {
				text: 'FOO',
				range: {
					start: 6,
					end: 9
				}
			},
			arguments: [
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
			],
			comment: {
				text: 'FOO',
				range: {
					start: 23,
					end: 26
				}
			}
		});
	});
	it('label: equ $34', () => {
		assert.deepStrictEqual(parseAsmLine('label: equ $34'), {
			label: {
				text: 'label',
				range: {
					start: 0,
					end: 5
				}
			},
			command: {
				text: 'equ',
				range: {
					start: 7,
					end: 10
				}
			},
			arguments: [
				{
					text: '$34',
					range: {
						start: 11,
						end: 14
					}
				}
			],
			comment: undefined
		});
	});
});