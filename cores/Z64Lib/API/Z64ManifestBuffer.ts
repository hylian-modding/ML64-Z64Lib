import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";

export class ManifestBuffer {
    buf: Buffer;
    cur: number = 0;
    start: number;
    advance: number = 0x4;
    constructor(buf: Buffer, start = 0) {
        this.buf = buf;
        this.start = start;
    }

    GoTo(num: number) {
        this.cur = num;
    }

    Write32(data: number, relative = true) {
        let w = data;
        if (relative) {
            w += this.start
        }
        this.buf.writeUInt32BE(w, this.cur);
        this.cur += this.advance;
    }

    Hi32(data: number) {
        let temp: Buffer = Buffer.alloc(0x4);
        temp.writeUInt32BE(data, 0);
        this.buf.writeUInt32BE(temp.readUInt16BE(0), this.cur);
    }

    Lo32(data: number) {
        let temp: Buffer = Buffer.alloc(0x4);
        temp.writeUInt32BE(data, 0);
        this.buf.writeUInt32BE(temp.readUInt16BE(2), this.cur);
    }

    HexString(hex: string) {
        let b = Buffer.from(hex, 'hex');
        b.copy(this.buf, this.cur);
        this.cur += b.byteLength;
    }

    Write8(num: number) {
        this.buf.writeUInt8(num, this.cur);
        this.cur += 0x1;
    }

    SetAdvance(num: number) {
        this.advance = num;
    }

    Write16(num: number) {
        this.buf.writeUInt16BE(num, this.cur);
        this.cur += 0x2;
    }

    Float(num: number) {
        this.buf.writeFloatBE(num, this.cur);
        this.cur += 0x4;
    }
}

export interface IManifest {
    repoint(ModLoader: IModLoaderAPI, rom: Buffer): void;
    inject(ModLoader: IModLoaderAPI, rom: Buffer, model: Buffer): void;
}