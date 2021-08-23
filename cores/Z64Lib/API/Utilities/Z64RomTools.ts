import { IModLoaderAPI } from 'modloader64_api/IModLoaderAPI';
import { PatchTypes } from 'modloader64_api/Patchers/PatchManager';
import { Z64LibSupportedGames } from './Z64LibSupportedGames';
import { RomHeap } from 'modloader64_api/romheap';
import fs from 'fs';
import path from 'path';

let VROM_END = 0x04000000;
const mb = Buffer.alloc(1 * 1024 * 1024);
let HAS_MOVED_CODE_FILE: boolean = false;
let heap!: RomHeap;

export class Z64RomTools {

  private ModLoader: IModLoaderAPI;
  private DMA_Offset: number;
  private Particle_Offset: number;
  private Code_DMA: number;
  private DMA_DMA: number;
  private Actor_Offset: number;
  private Object_Offset: number;

  constructor(ModLoader: IModLoaderAPI, game: Z64LibSupportedGames) {
    this.ModLoader = ModLoader;
    switch (game) {
      case Z64LibSupportedGames.OCARINA_OF_TIME:
        this.DMA_Offset = 0x7430;
        this.Particle_Offset = 0xD6BA0;
        this.Code_DMA = 27;
        this.DMA_DMA = 2;
        this.Actor_Offset = 0xD7490;
        this.Object_Offset = 0xE7F58;
        break;
      case Z64LibSupportedGames.MAJORAS_MASK:
        this.DMA_Offset = 0x1A500;
        this.Particle_Offset = 0x1089E0;
        this.Code_DMA = 0x1F;
        this.DMA_DMA = 2;
        this.Actor_Offset = 0x109510;
        this.Object_Offset = 0x11CC80;
        break;
      case Z64LibSupportedGames.DEBUG_OF_TIME:
        this.DMA_Offset = 0x12F70;
        this.Particle_Offset = 0xF8B50;
        this.Code_DMA = 27;
        this.DMA_DMA = 2;
        this.Actor_Offset = 0xF9440;
        this.Object_Offset = 0x10A6C0;
        break;
    }
  }

  getCodeFile(rom: Buffer): Buffer {
    if (!HAS_MOVED_CODE_FILE) {
      let code: Buffer = this.decompressDMAFileFromRom(rom, this.Code_DMA);
      this.relocateFileToExtendedRom(rom, this.Code_DMA, code, code.byteLength, true);
      HAS_MOVED_CODE_FILE = true;
    }
    return this.decompressDMAFileFromRom(rom, this.Code_DMA);
  }

  isFileCompressed(rom: Buffer, index: number) {
    let dma = this.DMA_Offset;
    let offset: number = index * 0x10;
    let start: number = rom.readUInt32BE(dma + offset + 0x8);
    let end: number = rom.readUInt32BE(dma + offset + 0xc);
    let size: number = end - start;
    let isFileCompressed = true;
    if (end === 0) {
      isFileCompressed = false;
      size = rom.readUInt32BE(dma + offset + 0x4) - rom.readUInt32BE(dma + offset);
      end = start + size;
    }
    return isFileCompressed;
  }

  injectActorIntoSlot(rom: Buffer, actorID: number, file: Buffer, initvars: string): boolean {
    let dma_id: number = this.findDMAIndexOfActor(rom, actorID);
    // Replace file and DMA entry first.
    if (this.recompressDMAFileIntoRom(rom, dma_id, file)) {
      this.relocateFileToExtendedRom(rom, dma_id, file);
    }
    // Check for init variables.
    let init: Buffer = Buffer.from(initvars, 'hex');
    let init_start: number = file.indexOf(init);
    if (init_start === -1) {
      return false;
    }
    // Wipe entry in overlay table.
    let code: Buffer = this.decompressDMAFileFromRom(rom, this.Code_DMA);
    for (let i = 0; i < (8 * 4); i++) {
      code.writeUInt8(0x0D7490 + (actorID * 0x20) + i, 0);
    }
    // Create new overlay table entry.
    let dma_data = this.getStartEndOfDMAEntry(rom, dma_id);
    code.writeUInt32BE(dma_data.vrom_start, 0x0D7490 + (actorID * 0x20) + 0x0);
    code.writeUInt32BE(dma_data.vrom_end, 0x0D7490 + (actorID * 0x20) + 0x4);
    code.writeUInt32BE(0x80800000, 0x0D7490 + (actorID * 0x20) + 0x8);
    code.writeUInt32BE(0x80800000 + file.byteLength, 0x0D7490 + (actorID * 0x20) + 0xC);
    code.writeUInt32BE(0, 0x0D7490 + (actorID * 0x20) + 0x10);
    code.writeUInt32BE(0x80800000 + init_start, 0x0D7490 + (actorID * 0x20) + 0x14);
    code.writeUInt32BE(0, 0x0D7490 + (actorID * 0x20) + 0x18);
    code.writeUInt32BE(0, 0x0D7490 + (actorID * 0x20) + 0x1C);
    return true;
  }

  getStartEndOfDMAEntry(rom: Buffer, index: number) {
    let dma = this.DMA_Offset;
    let offset: number = index * 0x10;
    let vrom_start: number = rom.readUInt32BE(dma + offset + 0x0);
    let vrom_end: number = rom.readUInt32BE(dma + offset + 0x4);
    let start: number = rom.readUInt32BE(dma + offset + 0x8);
    let end: number = rom.readUInt32BE(dma + offset + 0xc);
    return { vrom_start, vrom_end, start, end };
  }

  decompressDMAFileFromRom(rom: Buffer, index: number): Buffer {
    let dma = this.DMA_Offset;
    let offset: number = index * 0x10;
    let start: number = rom.readUInt32BE(dma + offset + 0x8);
    let end: number = rom.readUInt32BE(dma + offset + 0xc);
    if (start === 0xFFFFFFFF) {
      return Buffer.alloc(0xFF);
    }
    let size: number = end - start;
    let isFileCompressed = true;
    if (end === 0) {
      isFileCompressed = false;
      size = rom.readUInt32BE(dma + offset + 0x4) - rom.readUInt32BE(dma + offset);
      end = start + size;
    }
    if (start === 0) {
      return Buffer.alloc(1);
    }
    let buf: Buffer = Buffer.alloc(size);
    rom.copy(buf, 0, start, end);
    if (isFileCompressed) {
      if (buf.readUInt32BE(0) !== 0x59617A30) {
        return buf;
      }
      buf = this.ModLoader.utils.yaz0Decode(buf);
    }
    return buf;
  }

  getRawDMAFileFromRom(rom: Buffer, index: number): Buffer {
    let dma = this.DMA_Offset;
    let offset: number = index * 0x10;
    let start: number = rom.readUInt32BE(dma + offset + 0x8);
    let end: number = rom.readUInt32BE(dma + offset + 0xc);
    let size: number = end - start;
    let isFileCompressed = true;
    if (end === 0) {
      isFileCompressed = false;
      size =
        rom.readUInt32BE(dma + offset + 0x4) - rom.readUInt32BE(dma + offset);
      end = start + size;
    }
    let buf: Buffer = Buffer.alloc(size);
    rom.copy(buf, 0, start, end);
    return buf;
  }

  recompressDMAFileIntoRom(rom: Buffer, index: number, file: Buffer): boolean {
    let original: Buffer = this.getRawDMAFileFromRom(rom, index);
    let dma = this.DMA_Offset;
    let offset: number = index * 0x10;
    let start: number = rom.readUInt32BE(dma + offset + 0x8);
    let end: number = rom.readUInt32BE(dma + offset + 0xc);
    let size: number = end - start;
    let isFileCompressed = true;
    if (end === 0) {
      isFileCompressed = false;
      size = rom.readUInt32BE(dma + offset + 0x4) - rom.readUInt32BE(dma + offset);
      end = start + size;
    }
    if (isFileCompressed) {
      let buf: Buffer = this.ModLoader.utils.yaz0Encode(file);
      if (buf.byteLength > original.byteLength) {
        return false;
      }
      buf.copy(rom, start);
    } else {
      if (file.byteLength > original.byteLength) {
        return false;
      }
      file.copy(rom, start);
    }
    return true;
  }

  findDMAIndexOfParticle(rom: Buffer, index: number): number {
    let code: Buffer = this.decompressDMAFileFromRom(rom, this.Code_DMA);
    let dma: Buffer = this.decompressDMAFileFromRom(rom, this.DMA_DMA);
    let offset = this.Particle_Offset + (index * 0x1C);
    let search: Buffer = code.slice(offset, offset + 0x8);
    let dma_index: number = dma.indexOf(search) / 0x10;
    return dma_index;
  }

  decompressParticleFileFromRom(rom: Buffer, index: number): Buffer {
    let dma_index: number = this.findDMAIndexOfParticle(rom, index);
    return this.decompressDMAFileFromRom(rom, dma_index);
  }

  recompressParticleFileIntoRom(rom: Buffer, index: number, file: Buffer): boolean {
    let dma_index: number = this.findDMAIndexOfParticle(rom, index);
    return this.recompressDMAFileIntoRom(rom, dma_index, file);
  }

  findDMAIndexOfActor(rom: Buffer, index: number): number {
    let size: number = 0x20;
    let code: Buffer = this.decompressDMAFileFromRom(rom, this.Code_DMA);
    let dma: Buffer = this.decompressDMAFileFromRom(rom, this.DMA_DMA);
    let offset: number = this.Actor_Offset + (index * size);
    let search: Buffer = code.slice(offset, offset + 0x8);
    let dma_index: number = dma.indexOf(search) / 0x10;
    return dma_index;
  }

  decompressActorFileFromRom(rom: Buffer, index: number): Buffer {
    let dma_index: number = this.findDMAIndexOfActor(rom, index);
    return this.decompressDMAFileFromRom(rom, dma_index);
  }

  recompressActorFileIntoRom(rom: Buffer, index: number, file: Buffer): boolean {
    let dma_index: number = this.findDMAIndexOfActor(rom, index);
    return this.recompressDMAFileIntoRom(rom, dma_index, file);
  }

  findDMAIndexOfObject(rom: Buffer, index: number): number {
    let size: number = 0x8;
    let code: Buffer = this.decompressDMAFileFromRom(rom, this.Code_DMA);
    let dma: Buffer = this.decompressDMAFileFromRom(rom, this.DMA_DMA);
    let offset: number = this.Object_Offset + (index * size);
    let search: Buffer = code.slice(offset, offset + 0x8);
    let dma_index: number = dma.indexOf(search) / 0x10;
    return dma_index;
  }

  decompressObjectFileFromRom(rom: Buffer, index: number): Buffer {
    let dma_index: number = this.findDMAIndexOfObject(rom, index);
    return this.decompressDMAFileFromRom(rom, dma_index);
  }

  recompressObjectFileIntoRom(rom: Buffer, index: number, file: Buffer): boolean {
    let dma_index: number = this.findDMAIndexOfObject(rom, index);
    return this.recompressDMAFileIntoRom(rom, dma_index, file);
  }

  relocateFileToExtendedRom(rom: Buffer, index: number, file: Buffer, sizeOverride = 0, nocompress = false): number {
    if (heap === undefined){
      let f = rom.indexOf(mb, 0x2000000);
      heap = new RomHeap(this.ModLoader.rom, f, (0x100 * 1024 * 1024) - f);
    }
    let r = 0;
    let buf: Buffer = file;
    if (!nocompress) {
      buf = this.ModLoader.utils.yaz0Encode(file);
    }
    let alloc = heap.malloc(buf.byteLength);
    let dma = this.DMA_Offset;
    let offset: number = index * 0x10;
    if (sizeOverride > 0) {
      if (!nocompress) {
        let vram_start: number = alloc;
        let vram_end: number = vram_start + sizeOverride;
        rom.writeUInt32BE(vram_start, dma + offset);
        rom.writeUInt32BE(vram_end, dma + offset + 0x4);
      }
      let temp = Buffer.alloc(sizeOverride);
      file.copy(temp)
      file = temp;
    }
    if (nocompress) {
      rom.writeUInt32BE(alloc, dma + offset + 0x8);
      rom.writeUInt32BE(0x0, dma + offset + 0xC);
    } else {
      rom.writeUInt32BE(alloc, dma + offset + 0x8);
      rom.writeUInt32BE(alloc + buf!.byteLength, dma + offset + 0xC);
    }
    let start: number = rom.readUInt32BE(dma + offset + 0x8);
    let end: number = rom.readUInt32BE(dma + offset + 0xc);
    let size: number = end - start;
    let isFileCompressed = true;
    if (end === 0) {
      isFileCompressed = false;
      size = rom.readUInt32BE(dma + offset + 0x4) - rom.readUInt32BE(dma + offset);
      end = start + size;
    }
    if (isFileCompressed && !nocompress) {
      buf!.copy(rom, start);
      r = buf!.byteLength;
    } else {
      file.copy(rom, start);
      r = file.byteLength;
    }
    let loc = alloc;
    return loc;
  }

  injectNewFile(rom: Buffer, index: number, file: Buffer, nocompress: boolean = false) {
    if (heap === undefined){
      let f = rom.indexOf(mb, 0x2000000);
      heap = new RomHeap(this.ModLoader.rom, f, (0x100 * 1024 * 1024) - f);
    }
    let r = 0;
    let buf: Buffer = file;
    if (!nocompress) {
      buf = this.ModLoader.utils.yaz0Encode(file);
    }
    let alloc = heap.malloc(buf.byteLength);
    let dma = this.DMA_Offset;
    let offset: number = index * 0x10;
    rom.writeUInt32BE(VROM_END, dma + offset + 0x0);
    rom.writeUInt32BE(VROM_END + file.byteLength, dma + offset + 0x4);
    VROM_END += file.byteLength;
    rom.writeUInt32BE(alloc, dma + offset + 0x8);
    if (nocompress) {
      rom.writeUInt32BE(0x0, dma + offset + 0xC);
    } else {
      rom.writeUInt32BE(alloc + buf.byteLength, dma + offset + 0xC);
    }
    let start: number = rom.readUInt32BE(dma + offset + 0x8);
    let end: number = rom.readUInt32BE(dma + offset + 0xc);
    let size: number = end - start;
    let isFileCompressed = true;
    if (end === 0) {
      isFileCompressed = false;
      size = rom.readUInt32BE(dma + offset + 0x4) - rom.readUInt32BE(dma + offset);
      end = start + size;
    }
    if (isFileCompressed) {
      buf.copy(rom, start);
      r = buf.byteLength;
    } else {
      file.copy(rom, start);
      r = file.byteLength;
    }
    return r;
  }

  fixLinkObjectTableEntry(rom: Buffer, code: Buffer, game: Z64LibSupportedGames): Buffer {
    let offset: number = 0x11CD08;
    let dma = this.decompressDMAFileFromRom(rom, this.DMA_DMA);
    let vram_start: number = dma.readUInt32BE((654 * 0x10));
    let vram_end: number = dma.readUInt32BE((654 * 0x10) + 0x4);
    code.writeUInt32BE(vram_start, offset);
    code.writeUInt32BE(vram_end, offset + 0x4);
    return code;
  }

  noCRC(rom: Buffer) {
    rom = PatchTypes.get(".txt")!.patch(rom, fs.readFileSync(path.join(__dirname, "no_crc.txt")));
  }

}

export function trimBuffer(buffer: Buffer) {
  var pos = 0;
  for (var i = buffer.length - 1; i >= 0; i--) {
    if (buffer[i] !== 0x00) {
      pos = i;
      break;
    }
  }
  pos++;
  while (pos % 0x10 !== 0) {
    pos++;
  }
  return buffer.slice(0, pos);
}
