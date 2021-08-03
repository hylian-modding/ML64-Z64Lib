import IMemory from 'modloader64_api/IMemory';
import { JSONTemplate } from 'modloader64_api/JSONTemplate';
import * as Z64API from '../../API/imports';
import * as Z64CORE from '../importsOoT';

export const enum SwordBitMap {
    KOKIRI = 7,
    MASTER = 6,
    GIANT = 5,
    BIGGORON = 5,
}

export class SwordsEquipment extends JSONTemplate implements Pick<Z64API.Z64.ISwords, 'kokiriSword' | 'masterSword' |
    'giantKnife' | 'biggoronSword'>{
    private emulator: IMemory;
    private instance: number = Z64CORE.Z64_SAVE;
    private equipment_addr: number = this.instance + 0x009c + 1;
    private biggoron_flag_addr: number = this.instance + 0x003e;
    private biggoron_dmg_addr: number = this.instance + 0x0036;
    jsonFields: string[] = [
        'kokiriSword',
        'masterSword',
        'giantKnife',
        'biggoronSword',
    ];
    constructor(emulator: IMemory) {
        super();
        this.emulator = emulator;
    }

    get kokiriSword(): Z64API.Z64.Sword {
        let bits = this.emulator.rdramReadBits8(this.equipment_addr);
        if (bits[SwordBitMap.KOKIRI] === 1) return Z64API.Z64.Sword.KOKIRI_OOT;
        else return Z64API.Z64.Sword.NONE;
    }
    set kokiriSword(flag: Z64API.Z64.Sword) {
        let bits = this.emulator.rdramReadBits8(this.equipment_addr);
        bits[SwordBitMap.KOKIRI] = flag;
        this.emulator.rdramWriteBits8(this.equipment_addr, bits);
    }
    get masterSword() {
        let bits = this.emulator.rdramReadBits8(this.equipment_addr);
        if (bits[SwordBitMap.MASTER] === 1) return Z64API.Z64.Sword.MASTER;
        else return Z64API.Z64.Sword.NONE;
    }
    set masterSword(flag: Z64API.Z64.Sword) {
        let bits = this.emulator.rdramReadBits8(this.equipment_addr);
        bits[SwordBitMap.MASTER] = flag;
        this.emulator.rdramWriteBits8(this.equipment_addr, bits);
    }
    get giantKnife() {
        let bits = this.emulator.rdramReadBits8(this.equipment_addr);
        if (bits[SwordBitMap.GIANT] === 1) return Z64API.Z64.Sword.GIANT_KNIFE
        else if (this.emulator.rdramRead8(this.biggoron_flag_addr) === 0) return Z64API.Z64.Sword.GIANT_KNIFE;
        else return Z64API.Z64.Sword.NONE;
    }
    set giantKnife(flag: Z64API.Z64.Sword) {
        let bits = this.emulator.rdramReadBits8(this.equipment_addr);
        bits[SwordBitMap.GIANT] = flag;
        this.emulator.rdramWriteBits8(this.equipment_addr, bits);
        this.emulator.rdramWrite8(this.biggoron_flag_addr, 0);
        this.emulator.rdramWrite16(this.biggoron_dmg_addr, 8);
    }
    get biggoronSword() {
        let bits = this.emulator.rdramReadBits8(this.equipment_addr);
        if (bits[SwordBitMap.BIGGORON] === 1) return Z64API.Z64.Sword.BIGGORON
        else if (this.emulator.rdramRead8(this.biggoron_flag_addr) === 1) return Z64API.Z64.Sword.BIGGORON;
        else return Z64API.Z64.Sword.NONE;
    }
    set biggoronSword(flag: Z64API.Z64.Sword) {
        let bits = this.emulator.rdramReadBits8(this.equipment_addr);
        bits[SwordBitMap.BIGGORON] = flag;
        this.emulator.rdramWriteBits8(this.equipment_addr, bits);
        this.emulator.rdramWrite8(this.biggoron_flag_addr, bits[SwordBitMap.BIGGORON] ? 1 : 0);
    }
}
