import { IZ64Core } from '@Z64Lib/API/Common/Z64API';
import IMemory from 'modloader64_api/IMemory';
import { JSONTemplate } from 'modloader64_api/JSONTemplate';
import * as Z64API from '../../API/imports';
import * as Z64CORE from '../importsZ64';

export const enum SwordBitMap {
  KOKIRI_OOT = 7,
  MASTER = 6,
  GIANT = 5,
  BIGGORON = 5,
  KOKIRI_MM = 7,
  GILDED = 6
}

export class SwordsEquipment extends JSONTemplate implements Z64API.Z64.ISwords {
  private emulator: IMemory;
  private biggoron_flag_addr: number = Z64CORE.Z64.Z64_SAVE + 0x003e;
  private biggoron_dmg_addr: number = Z64CORE.Z64.Z64_SAVE + 0x0036;
  private core: IZ64Core;

  jsonFields: string[] = [
    'kokiriSword',
    'masterSword',
    'giantKnife',
    'biggoronSword',
    'swordLevel',
  ];
  constructor(emulator: IMemory, core: IZ64Core) {
    super();
    this.emulator = emulator;
    this.core = core;
  }
  get kokiriSword() {
    return this.emulator.rdramReadBit8(Z64CORE.Z64.Z64_EQUIP_ADDR + 1, SwordBitMap.KOKIRI_OOT);
  }
  set kokiriSword(bool: boolean) {
    this.emulator.rdramWriteBit8(Z64CORE.Z64.Z64_EQUIP_ADDR + 1, SwordBitMap.KOKIRI_OOT, bool);
  }
  get masterSword() {
    return this.emulator.rdramReadBit8(Z64CORE.Z64.Z64_EQUIP_ADDR + 1, SwordBitMap.MASTER);
  }
  set masterSword(bool: boolean) {
    this.emulator.rdramWriteBit8(Z64CORE.Z64.Z64_EQUIP_ADDR + 1, SwordBitMap.MASTER, bool);
  }
  get giantKnife() {
    return this.emulator.rdramReadBit8(Z64CORE.Z64.Z64_EQUIP_ADDR + 1, SwordBitMap.GIANT) && this.emulator.rdramRead8(this.biggoron_flag_addr) === 0;
  }
  set giantKnife(bool: boolean) {
    this.emulator.rdramWriteBit8(Z64CORE.Z64.Z64_EQUIP_ADDR + 1, SwordBitMap.GIANT, bool);
    this.emulator.rdramWrite8(this.biggoron_flag_addr, 0);
    this.emulator.rdramWrite16(this.biggoron_dmg_addr, 8);
  }
  get biggoronSword() {
    return this.emulator.rdramReadBit8(Z64CORE.Z64.Z64_EQUIP_ADDR + 1, SwordBitMap.BIGGORON) && this.emulator.rdramRead8(this.biggoron_flag_addr) === 1;
  }
  set biggoronSword(bool: boolean) {
    this.emulator.rdramWriteBit8(
      Z64CORE.Z64.Z64_SAVE,
      SwordBitMap.BIGGORON,
      bool
    );
    this.emulator.rdramWrite8(this.biggoron_flag_addr, bool ? 1 : 0);
  }

  get swordLevel(): Z64API.Z64.Sword {
    let bits = this.emulator.rdramReadBits8(Z64CORE.Z64.Z64_EQUIP_ADDR);
    if (bits[SwordBitMap.KOKIRI_MM] === 1 && bits[SwordBitMap.GILDED] === 0) {
      return Z64API.Z64.Sword.KOKIRI_MM;
    } else if (bits[SwordBitMap.KOKIRI_MM] === 0 && bits[SwordBitMap.GILDED] === 1) {
      return Z64API.Z64.Sword.RAZOR;
    } else if (bits[SwordBitMap.KOKIRI_MM] === 1 && bits[SwordBitMap.GILDED] === 1) {
      return Z64API.Z64.Sword.GILDED;
    } else {
      return Z64API.Z64.Sword.NONE;
    }
  }

  set swordLevel(level: Z64API.Z64.Sword) {
    let bits = this.emulator.rdramReadBits8(Z64CORE.Z64.Z64_EQUIP_ADDR);
    switch (level) {
      case Z64API.Z64.Sword.NONE:
        bits[SwordBitMap.KOKIRI_MM] = 0;
        bits[SwordBitMap.GILDED] = 0;
        break;
      case Z64API.Z64.Sword.KOKIRI_MM:
        bits[SwordBitMap.KOKIRI_MM] = 1;
        bits[SwordBitMap.GILDED] = 0;
        break;
      case Z64API.Z64.Sword.RAZOR:
        bits[SwordBitMap.KOKIRI_MM] = 0;
        bits[SwordBitMap.GILDED] = 1;
        break;
      case Z64API.Z64.Sword.GILDED:
        bits[SwordBitMap.KOKIRI_MM] = 1;
        bits[SwordBitMap.GILDED] = 1;
        break;
    }
    this.emulator.rdramWriteBits8(Z64CORE.Z64.Z64_EQUIP_ADDR, bits);
  }

  updateSwordonB(): void {
    let level = this.swordLevel;
    switch (level) {
      case Z64API.Z64.Sword.NONE:
        if (this.emulator.rdramRead8(0x1EF6BC) !== 0x50) {
          this.emulator.rdramWrite8(0x1EF6BC, 0xFF);
        }
        break;
      case Z64API.Z64.Sword.KOKIRI_MM:
        if (this.emulator.rdramRead8(0x1EF6BC) !== 0x50) {
          this.emulator.rdramWrite8(0x1EF6BC, 0x4D);
        }
        break;
      case Z64API.Z64.Sword.RAZOR:
        if (this.emulator.rdramRead8(0x1EF6BC) !== 0x50) {
          this.emulator.rdramWrite8(0x1EF6BC, 0x4E);
        }
        break;
      case Z64API.Z64.Sword.GILDED:
        if (this.emulator.rdramRead8(0x1EF6BC) !== 0x50) {
          this.emulator.rdramWrite8(0x1EF6BC, 0x4F);
        }
        break;
    }
    this.core.commandBuffer.updateButton(0);
  }
}