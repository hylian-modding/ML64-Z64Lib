import { JSONTemplate } from "modloader64_api/JSONTemplate";
import * as Z64API from '../../API/imports';
import * as Z64CORE from '../importsZ64';
import IMemory from "modloader64_api/IMemory";
import { Flag, FlagManager } from "modloader64_api/FlagManager";

export class Stray extends JSONTemplate implements Z64API.MM.IStray {
    private emulator: IMemory;
    private strayFlags: FlagManager;
    private woodfall_fairies = 0x801EF744; //0x1
    private snowhead_fairies = 0x801EF745; //0x1
    private bay_fairies = 0x801EF746; //0x1
    private stone_fairies = 0x801EF747; //0x1
    private strayClockTownAddr = 0x801F0570;
    jsonFields: string[] = [
        'strayWoodfall',
        'straySnowhead',
        'strayBay',
        'strayStone',
        'strayClockTown'
    ];
    constructor(emulator: IMemory) {
        super();
        this.emulator = emulator;
        this.strayFlags = new FlagManager(emulator, this.strayClockTownAddr);
    }

    get strayWoodfall(): number {
        return this.emulator.rdramRead8(this.woodfall_fairies);
    }

    set strayWoodfall(flag: number) {
        this.emulator.rdramWrite8(this.woodfall_fairies, flag);
    }

    get straySnowhead(): number {
        return this.emulator.rdramRead8(this.snowhead_fairies);
    }

    set straySnowhead(flag: number) {
        this.emulator.rdramWrite8(this.snowhead_fairies, flag);
    }

    get strayBay(): number {
        return this.emulator.rdramRead8(this.bay_fairies);
    }

    set strayBay(flag: number) {
        this.emulator.rdramWrite8(this.bay_fairies, flag);
    }

    get strayStone(): number {
        return this.emulator.rdramRead8(this.stone_fairies);
    }

    set strayStone(flag: number) {
        this.emulator.rdramWrite8(this.stone_fairies, flag);
    }

    private strayClockTownFlag = new Flag(0x0, 0x0);
    get strayClockTown(): boolean {
        return this.strayFlags.isFlagSet(this.strayClockTownFlag);
    }
    set strayClockTown(bool: boolean) {
        this.strayFlags.setFlag(this.strayClockTownFlag, bool);
    }
}