import IMemory from 'modloader64_api/IMemory';
import * as Z64API from '../../API/imports';
import * as Z64CORE from '../importsZ64';

export class KeyManager implements Z64API.Z64.IKeyManager {
  private readonly KEY_ARRAY_ADDR: number = Z64CORE.Z64.Z64_SAVE + 0xbc;
  private readonly KEY_ARRAY_SIZE: number = 0x14;
  private readonly emulator: IMemory;

  constructor(emulator: IMemory) {
      this.emulator = emulator;
  }

  getKeyCountForIndex(index: number): number {
      if (index > this.KEY_ARRAY_ADDR) {
          return Z64API.Z64.NO_KEYS;
      }
      return this.emulator.rdramRead8(this.KEY_ARRAY_ADDR + index);
  }

  setKeyCountByIndex(index: number, count: number): void {
      if (index > this.KEY_ARRAY_ADDR) {
          return;
      }
      this.emulator.rdramWrite8(this.KEY_ARRAY_ADDR + index, count);
  }

  getRawKeyBuffer(): Buffer {
      return this.emulator.rdramReadBuffer(
          this.KEY_ARRAY_ADDR,
          this.KEY_ARRAY_SIZE
      );
  }
}
