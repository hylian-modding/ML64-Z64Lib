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
    set dekuShield(flag: Z64API.Z64.Shield) {
        let bits = this.emulator.rdramReadBits8(this.equipment_addr);
        bits[ShieldBitMap.DEKU] = flag;
        this.emulator.rdramWriteBits8(this.equipment_addr, bits);
    }
    get dekuShield(): Z64API.Z64.Shield {
        let bits = this.emulator.rdramReadBits8(this.equipment_addr);
        if (bits[ShieldBitMap.DEKU] === 1) return Z64API.Z64.Shield.DEKU;
        else return Z64API.Z64.Shield.NONE;
    }
    set hylianShield(flag: Z64API.Z64.Shield) {
        let bits = this.emulator.rdramReadBits8(this.equipment_addr);
        bits[ShieldBitMap.HYLIAN] = flag;
        this.emulator.rdramWriteBits8(this.equipment_addr, bits);
    }
    get hylianShield(): Z64API.Z64.Shield {
        let bits = this.emulator.rdramReadBits8(this.equipment_addr);
        if (bits[ShieldBitMap.HYLIAN] === 1) return Z64API.Z64.Shield.HYLIAN;
        else return Z64API.Z64.Shield.NONE;
    }
    set mirrorShield(flag: Z64API.Z64.Shield) {
        let bits = this.emulator.rdramReadBits8(this.equipment_addr);
        bits[ShieldBitMap.MIRROR] = flag;
        this.emulator.rdramWriteBits8(this.equipment_addr, bits);
    }
    get mirrorShield(): Z64API.Z64.Shield {
        let bits = this.emulator.rdramReadBits8(this.equipment_addr);
        if (bits[ShieldBitMap.MIRROR] === 1) return Z64API.Z64.Shield.MIRROR_OOT;
        else return Z64API.Z64.Shield.NONE;
    }
}
