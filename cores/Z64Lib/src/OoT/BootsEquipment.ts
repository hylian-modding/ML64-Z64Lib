import IMemory from 'modloader64_api/IMemory';
import { JSONTemplate } from 'modloader64_api/JSONTemplate';
import * as Z64API from '../../API/imports';
import * as Z64CORE from '../importsZ64';

export const enum BootsBitMap {
  KOKIRI = 3,
  IRON = 2,
  HOVER = 1,
}

export class BootsEquipment extends JSONTemplate implements Z64API.OoT.IBoots {
  private emulator: IMemory;
  private instance: number = Z64CORE.Z64.Z64_SAVE;
  private equipment_addr: number = this.instance + 0x009c;
  jsonFields: string[] = ['kokiriBoots', 'ironBoots', 'hoverBoots'];
  constructor(emulator: IMemory) {
      super();
      this.emulator = emulator;
  }
  get kokiriBoots() {
      return this.emulator.rdramReadBit8(this.equipment_addr, BootsBitMap.KOKIRI);
  }
  set kokiriBoots(bool: boolean) {
      this.emulator.rdramWriteBit8(this.equipment_addr, BootsBitMap.KOKIRI, bool);
  }
  get ironBoots() {
      return this.emulator.rdramReadBit8(this.equipment_addr, BootsBitMap.IRON);
  }
  set ironBoots(bool: boolean) {
      this.emulator.rdramWriteBit8(this.equipment_addr, BootsBitMap.IRON, bool);
  }
  get hoverBoots() {
      return this.emulator.rdramReadBit8(this.equipment_addr, BootsBitMap.HOVER);
  }
  set hoverBoots(bool: boolean) {
      this.emulator.rdramWriteBit8(this.equipment_addr, BootsBitMap.HOVER, bool);
  }
}
