import {IModLoaderAPI} from 'modloader64_api/IModLoaderAPI';

export class Z64RomTools{

    ModLoader: IModLoaderAPI;
    DMA_Offset: number;

    constructor(ModLoader: IModLoaderAPI, DMA_Offset: number){
        this.ModLoader = ModLoader;
        this.DMA_Offset = DMA_Offset;
    }

    decompressFileFromRom(rom: Buffer, index: number): Buffer {
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
        if (isFileCompressed) {
          buf = this.ModLoader.utils.yaz0Decode(buf);
        }
        return buf;
      }
    
      recompressFileIntoRom(rom: Buffer, index: number, file: Buffer) {
        let dma = this.DMA_Offset;
        let offset: number = index * 0x10;
        let start: number = rom.readUInt32BE(dma + offset + 0x8);
        let buf: Buffer = this.ModLoader.utils.yaz0Encode(file);
        buf.copy(rom, start);
      }
}