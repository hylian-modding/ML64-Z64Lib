import { JSONTemplate } from "modloader64_api/JSONTemplate";
import * as Z64API from '../../API/imports';
import * as Z64CORE from '../importsMM';
import IMemory from "modloader64_api/IMemory";

export class Photo implements Z64API.MM.IPhoto {
    private emulator: IMemory;
    private save: Z64API.MM.ISaveContext;
    private pictograph_photo_addr: number = 0x801F0750; //0x2BC0
    private pictograph_spec_addr: number = 0x801F04EA; //0x1
    private pictograph_quality_addr: number = 0x801F04EB; //0x1
    private pictograph_unk_addr: number = 0x801F04EC; //0x1

    constructor(emulator: IMemory, save: Z64API.MM.ISaveContext) {
        this.emulator = emulator;
        this.save = save;
    }

    get pictograph_photoChunk(): Buffer {
        return this.emulator.rdramReadBuffer(this.pictograph_photo_addr, 0x2BC0);
    }

    get pictograph_spec(): number {
        return this.emulator.rdramRead8(this.pictograph_spec);
    }

    set pictograph_spec(flag: number) {
        this.emulator.rdramWrite8(this.pictograph_spec, flag);
    }

    get pictograph_quality(): number {
        return this.emulator.rdramRead8(this.pictograph_quality);
    }

    set pictograph_photoChunk(buf: Buffer) {
        this.emulator.rdramWriteBuffer(this.pictograph_photo_addr, buf);
    }

    set pictograph_quality(flag: number) {
        this.emulator.rdramWrite8(this.pictograph_quality, flag);
    }

    get pictograph_unk(): number {
        return this.emulator.rdramRead8(this.pictograph_unk);
    }

    set pictograph_unk(flag: number) {
        this.emulator.rdramWrite8(this.pictograph_unk, flag);
    }

    get pictograph_used(): boolean {
        return this.save.pictoboxUsed;
    }

    set pictograph_used(b: boolean) {
        this.save.pictoboxUsed = b;
    }
}