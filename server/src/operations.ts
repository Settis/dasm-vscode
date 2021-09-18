import { OpMode } from "./opMode";

export const operations: OperationsSet = {
    BRK: {
        description: 'BRK causes a non-maskable interrupt and increments the program counter by one.',
        affectsFlags: ['B'],
        modes: {
            [OpMode.Implied] : {
                hex: 0x00,
                len: 1,
                tim: 7,
                boundaryCrossed: false
            }
        }
    }
};

type OperationsSet = {
    [name: string]: OperationDescription
}

type OperationDescription = {
    description: string,
    affectsFlags: string[],
    modes: ModesSet
}

type ModesSet = {
    [key in OpMode]?: ModeDescription;
}

type ModeDescription = {
    hex: number,
    len: number,
    tim: number,
    boundaryCrossed: boolean
}