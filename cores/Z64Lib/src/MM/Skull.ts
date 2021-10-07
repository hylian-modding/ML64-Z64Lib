import { JSONTemplate } from "modloader64_api/JSONTemplate";
import * as Z64API from '../../API/imports';
import * as Z64CORE from '../importsZ64';
import IMemory from "modloader64_api/IMemory";

export class Skull extends JSONTemplate implements Z64API.MM.ISkull {
    private emulator: IMemory;
    swamp_skulltula = 0x801F0530; //0x2
    bay_skulltula = 0x801F0532; //0x2
    jsonFields: string[] = [
        'swampSkulltula',
        'baySkulltula'
    ];
    constructor(emulator: IMemory) {
        super();
        this.emulator = emulator;
    }

    get swampSkulltula(): number {
        return this.emulator.rdramRead16(this.swamp_skulltula);
    }

    set swampSkulltula(flag: number) {
        this.emulator.rdramWrite16(this.swamp_skulltula, flag);
    }

    get baySkulltula(): number {
        return this.emulator.rdramRead16(this.bay_skulltula);
    }

    set baySkulltula(flag: number) {
        this.emulator.rdramWrite16(this.bay_skulltula, flag);
    }
}