import IMemory from 'modloader64_api/IMemory';
import { JSONTemplate } from 'modloader64_api/JSONTemplate';
import * as Z64API from '../../API/imports';
import * as Z64CORE from '../importsZ64';
export const enum TunicBitMap {
  KOKIRI = 7,
  GORON = 6,
  ZORA = 5,
}

export class TunicsEquipment extends JSONTemplate implements Z64API.OoT.ITunics {
  private emulator: IMemory;
  private instance: number = Z64CORE.Z64.Z64_SAVE;
  private equipment_addr: number = this.instance + 0x009c;
  jsonFields: string[] = ['kokiriTunic', 'goronTunic', 'zoraTunic'];
  constructor(emulator: IMemory) {
      super();
      this.emulator = emulator;
  }
  get kokiriTunic() {
      return this.emulator.rdramReadBit8(this.equipment_addr, TunicBitMap.KOKIRI);
  }
  set kokiriTunic(bool: boolean) {
      this.emulator.rdramWriteBit8(this.equipment_addr, TunicBitMap.KOKIRI, bool);
  }
  get goronTunic() {
      return this.emulator.rdramReadBit8(this.equipment_addr, TunicBitMap.GORON);
  }
  set goronTunic(bool: boolean) {
      this.emulator.rdramWriteBit8(this.equipment_addr, TunicBitMap.GORON, bool);
  }
  get zoraTunic() {
      return this.emulator.rdramReadBit8(this.equipment_addr, TunicBitMap.ZORA);
  }
  set zoraTunic(bool: boolean) {
      this.emulator.rdramWriteBit8(this.equipment_addr, TunicBitMap.ZORA, bool);
  }
}
