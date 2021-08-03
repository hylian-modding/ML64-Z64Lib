import IMemory from 'modloader64_api/IMemory';
import { JSONTemplate } from 'modloader64_api/JSONTemplate';
import * as Z64API from '../../API/imports';
import * as Z64CORE from '../importsMM';

export const enum SwordBitMap {
  KOKIRI_OOT = 7,
  MASTER = 6,
  GIANT = 5,
  BIGGORON = 5,
  KOKIRI_MM = 7,
  GILDED = 6
}

export class SwordsEquipment extends JSONTemplate implements Pick<Z64API.Z64.ISwords, 'swordLevel'>, Z64API.MM.ISwordHelper {
  private emulator: IMemory;
  private instance: number = Z64CORE.Z64_SAVE;
  private equipment_addr: number = this.instance + 0x6D;
  private commandBuf: Z64API.ICommandBuffer;
  jsonFields: string[] = [
    'kokiriSwordMM',
    'razorSword',
    'gildedSword',
  ];
  constructor(emulator: IMemory, commandBuf: Z64API.ICommandBuffer) {
    super();
    this.emulator = emulator;
    this.commandBuf = commandBuf;
  }

  get swordLevel(): Z64API.Z64.Sword {
    let bits = this.emulator.rdramReadBits8(this.equipment_addr);
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
    let bits = this.emulator.rdramReadBits8(this.equipment_addr);
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
    this.emulator.rdramWriteBits8(this.equipment_addr, bits);
  }

  updateSwordonB(): void {
    let level = this.swordLevel;
    switch (level) {
      case Z64API.Z64.Sword.NONE:
        if (this.emulator.rdramRead8(0x1EF6BC) !== 0x50) {
          this.emulator.rdramWrite8(0x1EF6BC, 0xFF);
          this.commandBuf.runCommand(Z64API.Command.UPDATEBUTTON, 0x0);
        }
        break;
      case Z64API.Z64.Sword.KOKIRI_MM:
        if (this.emulator.rdramRead8(0x1EF6BC) !== 0x50) {
          this.emulator.rdramWrite8(0x1EF6BC, 0x4D);
          this.commandBuf.runCommand(Z64API.Command.UPDATEBUTTON, 0x0);
        }
        break;
      case Z64API.Z64.Sword.RAZOR:
        if (this.emulator.rdramRead8(0x1EF6BC) !== 0x50) {
          this.emulator.rdramWrite8(0x1EF6BC, 0x4E);
          this.commandBuf.runCommand(Z64API.Command.UPDATEBUTTON, 0x0);
        }
        break;
      case Z64API.Z64.Sword.GILDED:
        if (this.emulator.rdramRead8(0x1EF6BC) !== 0x50) {
          this.emulator.rdramWrite8(0x1EF6BC, 0x4F);
          this.commandBuf.runCommand(Z64API.Command.UPDATEBUTTON, 0x0);
        }
        break;
    }
  }
}
