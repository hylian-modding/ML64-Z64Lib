import IMemory from 'modloader64_api/IMemory';
import * as Z64API from '../../API/imports';
import * as Z64CORE from '../importsZ64';
import { JSONTemplate } from 'modloader64_api/JSONTemplate';

export const enum ShieldBitMap {
  DEKU = 3,
  HYLIAN = 2,
  MIRROR_OOT = 1,

  HEROES = 1,
  MIRROR_MM = 2,
}

export class ShieldsEquipment extends JSONTemplate implements Z64API.Z64.IShields {
  private emulator: IMemory;
  jsonFields: string[] = ['dekuShield', 'hylianShield', 'mirrorShield', 'shieldLevel'];
  constructor(emulator: IMemory) {
    super();
    this.emulator = emulator;
  }
  set dekuShield(bool: boolean) {
    this.emulator.rdramWriteBit8(Z64CORE.Z64.Z64_EQUIP_ADDR + 1, ShieldBitMap.DEKU, bool);
  }
  get dekuShield(): boolean {
    return this.emulator.rdramReadBit8(Z64CORE.Z64.Z64_EQUIP_ADDR + 1, ShieldBitMap.DEKU);
  }
  set hylianShield(bool: boolean) {
    this.emulator.rdramWriteBit8(
      Z64CORE.Z64.Z64_EQUIP_ADDR + 1,
      ShieldBitMap.HYLIAN,
      bool
    );
  }
  get hylianShield(): boolean {
    return this.emulator.rdramReadBit8(
      Z64CORE.Z64.Z64_EQUIP_ADDR + 1,
      ShieldBitMap.HYLIAN
    );
  }
  set mirrorShield(bool: boolean) {
    this.emulator.rdramWriteBit8(
      Z64CORE.Z64.Z64_EQUIP_ADDR + 1,
      ShieldBitMap.MIRROR_OOT,
      bool
    );
  }
  get mirrorShield(): boolean {
    return this.emulator.rdramReadBit8(
      Z64CORE.Z64.Z64_EQUIP_ADDR + 1,
      ShieldBitMap.MIRROR_OOT
    );
  }
  get shieldLevel(): Z64API.Z64.Shield {
    let bits = this.emulator.rdramReadBits8(Z64CORE.Z64.Z64_EQUIP_ADDR);
    if (bits[ShieldBitMap.MIRROR_MM] === 0 && bits[ShieldBitMap.HEROES] === 1) {
      return Z64API.Z64.Shield.HERO;
    } else if (bits[ShieldBitMap.HEROES] === 0 && bits[ShieldBitMap.MIRROR_MM] === 1) {
      return Z64API.Z64.Shield.MIRROR_MM;
    } else {
      return Z64API.Z64.Shield.NONE;
    }
  }

  set shieldLevel(level: Z64API.Z64.Shield) {
    let bits = this.emulator.rdramReadBits8(Z64CORE.Z64.Z64_EQUIP_ADDR);
    switch (level) {
      case Z64API.Z64.Shield.NONE:
        bits[ShieldBitMap.HEROES] = 0;
        bits[ShieldBitMap.MIRROR_MM] = 0;
        break;
      case Z64API.Z64.Shield.HERO:
        bits[ShieldBitMap.HEROES] = 1;
        bits[ShieldBitMap.MIRROR_MM] = 0;
        break;
      case Z64API.Z64.Shield.MIRROR_MM:
        bits[ShieldBitMap.HEROES] = 0;
        bits[ShieldBitMap.MIRROR_MM] = 1;
        break;
    }
    this.emulator.rdramWriteBits8(Z64CORE.Z64.Z64_EQUIP_ADDR, bits);
  }

}