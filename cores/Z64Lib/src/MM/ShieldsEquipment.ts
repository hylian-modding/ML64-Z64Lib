import IMemory from 'modloader64_api/IMemory';
import * as Z64API from '../../API/imports';
import * as Z64CORE from '../importsMM';
import { JSONTemplate } from 'modloader64_api/JSONTemplate';

export const enum ShieldBitMap {
  HEROES = 0x3,
  MIRROR = 0x2,
}

export class ShieldsEquipment extends JSONTemplate implements Z64API.Z64.IShields {
  private emulator: IMemory;
  private instance: number = Z64CORE.Z64_SAVE;
  private equipment_addr: number = this.instance + 0x6D;
  jsonFields: string[] = ['heroesShield', 'mirrorShield'];
  constructor(emulator: IMemory) {
    super();
    this.emulator = emulator;
  }

  //TEMP
  dekuShield!: Z64API.Z64.Shield;
  hylianShield!: Z64API.Z64.Shield;
  mirrorShield!: Z64API.Z64.Shield;

  get shieldLevel(): Z64API.Z64.Shield {
    let bits = this.emulator.rdramReadBits8(this.equipment_addr);
    if (bits[ShieldBitMap.MIRROR] === 0 && bits[ShieldBitMap.HEROES] === 1) {
      return Z64API.Z64.Shield.HERO;
    } else if (bits[ShieldBitMap.HEROES] === 0 && bits[ShieldBitMap.MIRROR] === 1) {
      return Z64API.Z64.Shield.MIRROR_MM;
    } else {
      return Z64API.Z64.Shield.NONE;
    }
  }

  set shieldLevel(level: Z64API.Z64.Shield) {
    let bits = this.emulator.rdramReadBits8(this.equipment_addr);
    switch (level) {
      case Z64API.Z64.Shield.NONE:
        bits[ShieldBitMap.HEROES] = 0;
        bits[ShieldBitMap.MIRROR] = 0;
        break;
      case Z64API.Z64.Shield.HERO:
        bits[ShieldBitMap.HEROES] = 1;
        bits[ShieldBitMap.MIRROR] = 0;
        break;
      case Z64API.Z64.Shield.MIRROR_MM:
        bits[ShieldBitMap.HEROES] = 0;
        bits[ShieldBitMap.MIRROR] = 1;
        break;
    }
    this.emulator.rdramWriteBits8(this.equipment_addr, bits);
  }

}
