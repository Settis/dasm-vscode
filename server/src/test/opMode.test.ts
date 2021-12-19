import { OpMode, parseOpMode } from "../opMode";
import * as assert from 'assert';

describe('Operation mode parser', () => {
    it('Implied', () => {
        assert.deepStrictEqual(
            parseOpMode({
                text: '',
                range: {
                    start: 1,
                    end: 1
                }
            }),
            {
                mode: OpMode.Implied
            }
        );
    });
    it('Immediate', () => {
        assert.deepStrictEqual(
            parseOpMode({
                text: '#$67',
                range: {
                    start: 10,
                    end: 14
                }
            }),
            {
                mode: OpMode.Immediate,
                arg: {
                    text: '$67',
                    range: {
                        start: 11,
                        end: 14
                    }
                }
            }
        );
    });
    it('ZeroPage', () => {
        assert.deepStrictEqual(
            parseOpMode({
                text: '$13',
                range: {
                    start: 10,
                    end: 13
                }
            }),
            {
                mode: OpMode.Address,
                arg: {
                    text: '$13',
                    range: {
                        start: 10,
                        end: 13
                    }
                }
            }
        );
    });
    it('ZeroPageX', () => {
        assert.deepStrictEqual(
            parseOpMode({
                text: '$35,X',
                range: {
                    start: 10,
                    end: 15
                }
            }),
            {
                mode: OpMode.AddressX,
                arg: {
                    text: '$35',
                    range: {
                        start: 10,
                        end: 13
                    }
                }
            }
        );
    });
    it('ZeroPageY', () => {
        assert.deepStrictEqual(
            parseOpMode({
                text: '$35,Y',
                range: {
                    start: 10,
                    end: 15
                }
            }),
            {
                mode: OpMode.AddressY,
                arg: {
                    text: '$35',
                    range: {
                        start: 10,
                        end: 13
                    }
                }
            }
        );
    });
    it('Absolute', () => {
        assert.deepStrictEqual(
            parseOpMode({
                text: '$3545',
                range: {
                    start: 10,
                    end: 15
                }
            }),
            {
                mode: OpMode.Address,
                arg: {
                    text: '$3545',
                    range: {
                        start: 10,
                        end: 15
                    }
                }
            }
        );
    });
    it('AbsoluteX', () => {
        assert.deepStrictEqual(
            parseOpMode({
                text: '$3545,X',
                range: {
                    start: 10,
                    end: 17
                }
            }),
            {
                mode: OpMode.AddressX,
                arg: {
                    text: '$3545',
                    range: {
                        start: 10,
                        end: 15
                    }
                }
            }
        );
    });
    it('AbsoluteY', () => {
        assert.deepStrictEqual(
            parseOpMode({
                text: '$3545,Y',
                range: {
                    start: 10,
                    end: 17
                }
            }),
            {
                mode: OpMode.AddressY,
                arg: {
                    text: '$3545',
                    range: {
                        start: 10,
                        end: 15
                    }
                }
            }
        );
    });
    it('Indirect', () => {
        assert.deepStrictEqual(
            parseOpMode({
                text: '($3545)',
                range: {
                    start: 10,
                    end: 17
                }
            }),
            {
                mode: OpMode.Indirect,
                arg: {
                    text: '$3545',
                    range: {
                        start: 11,
                        end: 16
                    }
                }
            }
        );

    });
    it('IndirectX', () => {
        assert.deepStrictEqual(
            parseOpMode({
                text: '($45,X)',
                range: {
                    start: 10,
                    end: 17
                }
            }),
            {
                mode: OpMode.IndirectX,
                arg: {
                    text: '$45',
                    range: {
                        start: 11,
                        end: 14
                    }
                }
            }
        );
    });
    it('IndirectY', () => {
        assert.deepStrictEqual(
            parseOpMode({
                text: '($35),Y',
                range: {
                    start: 10,
                    end: 17
                }
            }),
            {
                mode: OpMode.IndirectY,
                arg: {
                    text: '$35',
                    range: {
                        start: 11,
                        end: 14
                    }
                }
            }
        );
    });
});