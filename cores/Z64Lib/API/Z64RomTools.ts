import { IModLoaderAPI } from 'modloader64_api/IModLoaderAPI';
import { Z64LibSupportedGames } from './Z64LibSupportedGames';

let CURRENT_EXTENDED_ROM_OFFSET: number = 0x2000000;

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
        this.DMA_Offset = 0x0;
        this.Particle_Offset = 0x0;
        this.Code_DMA = 0;
        this.DMA_DMA = 0;
        this.Actor_Offset = 0;
        this.Object_Offset = 0;
        break;
    }
  }

  decompressDMAFileFromRom(rom: Buffer, index: number): Buffer {
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
    console.log(start.toString(16) + " " + end.toString(16));
    return buf;
  }

  getRawDMAFileFromRom(rom: Buffer, index: number): Buffer {
    let dma = 0x7430;
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
    let dma_index: number = dma.indexOf(search) / size;
    return dma_index;
  }

  decompressActorFileFromRom(rom: Buffer, index: number): Buffer {
    let dma_index: number = this.findDMAIndexOfActor(rom, index);
    console.log(dma_index);
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
    let dma_index: number = dma.indexOf(search) / size;
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

  relocateFileToExtendedRom(rom: Buffer, index: number, file: Buffer, sizeOverride = 0): number {
    let r = 0;
    let buf: Buffer = this.ModLoader.utils.yaz0Encode(file);
    if (sizeOverride > 0) {
      let resize: Buffer = Buffer.alloc(sizeOverride);
      buf.copy(resize);
      buf = resize;
    }
    let dma = 0x7430;
    let offset: number = index * 0x10;
    rom.writeUInt32BE(CURRENT_EXTENDED_ROM_OFFSET, dma + offset + 0x8);
    rom.writeUInt32BE(CURRENT_EXTENDED_ROM_OFFSET + buf.byteLength, dma + offset + 0xC);
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
    CURRENT_EXTENDED_ROM_OFFSET += r;
    return r;
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
