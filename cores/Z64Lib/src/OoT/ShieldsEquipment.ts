import IMemory from 'modloader64_api/IMemory';
import { JSONTemplate } from 'modloader64_api/JSONTemplate';
import * as Z64API from '../../API/imports';
import * as Z64CORE from '../importsOoT';

export const enum ShieldBitMap {
    DEKU = 3,
    HYLIAN = 2,
    MIRROR = 1,
}

export class ShieldsEquipment extends JSONTemplate implements Pick<Z64API.Z64.IShields, 'dekuShield' | 'hylianShield' | 'mirrorShield'> {
    private emulator: IMemory;
    private instance: number = Z64CORE.Z64_SAVE;
    private equipment_addr: number = this.instance + 0x009c + 1;
    jsonFields: string[] = ['dekuShield', 'hylianShield', 'mirrorShield'];
    constructor(emulator: IMemory) {
        super();
        this.emulator = emulator;
    }
    set dekuShield(bool: boolean) {
        this.emulator.rdramWriteBit8(this.equipment_addr, ShieldBitMap.DEKU, bool);
    }
    get dekuShield(): boolean {
        return this.emulator.rdramReadBit8(this.equipment_addr, ShieldBitMap.DEKU);
    }
    set hylianShield(bool: boolean) {
        this.emulator.rdramWriteBit8(
            this.equipment_addr,
            ShieldBitMap.HYLIAN,
            bool
        );
    }
    get hylianShield(): boolean {
        return this.emulator.rdramReadBit8(
            this.equipment_addr,
            ShieldBitMap.HYLIAN
        );
    }
    set mirrorShield(bool: boolean) {
        this.emulator.rdramWriteBit8(
            this.equipment_addr,
            ShieldBitMap.MIRROR,
            bool
        );
    }
    get mirrorShield(): boolean {
        return this.emulator.rdramReadBit8(
            this.equipment_addr,
            ShieldBitMap.MIRROR
        );
    }
}