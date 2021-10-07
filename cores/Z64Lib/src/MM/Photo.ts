import { JSONTemplate } from "modloader64_api/JSONTemplate";
import * as Z64API from '../../API/imports';
import IMemory from "modloader64_api/IMemory";

export class Photo extends JSONTemplate implements Z64API.MM.IPhoto {
    private emulator: IMemory;
    private pictograph_photo_addr: number = 0x801F0750; //0x2BC0
    private pictograph_spec_addr: number = 0x801F04EA; //0x1
    private pictograph_quality_addr: number = 0x801F04EB; //0x1
    private pictograph_unk_addr: number = 0x801F04EC; //0x1
    jsonFields: string[] = [
        'pictograph_photoChunk',
        'pictograph_spec',
        'pictograph_quality',
        'pictograph_unk'
    ];
    constructor(emulator: IMemory) {
        super();
        this.emulator = emulator;
    }

    get pictograph_photoChunk(): Buffer {
        return this.emulator.rdramReadBuffer(this.pictograph_photo_addr, 0x2BC0);
    }

    set pictograph_photoChunk(buf: Buffer) {
        this.emulator.rdramWriteBuffer(this.pictograph_photo_addr, buf);
    }

    get pictograph_spec(): number {
        return this.emulator.rdramRead8(this.pictograph_spec_addr);
    }

    set pictograph_spec(flag: number) {
        this.emulator.rdramWrite8(this.pictograph_spec_addr, flag);
    }

    get pictograph_quality(): number {
        return this.emulator.rdramRead8(this.pictograph_quality_addr);
    }


    set pictograph_quality(flag: number) {
        this.emulator.rdramWrite8(this.pictograph_quality_addr, flag);
    }

    get pictograph_unk(): number {
        return this.emulator.rdramRead8(this.pictograph_unk_addr);
    }

    set pictograph_unk(flag: number) {
        this.emulator.rdramWrite8(this.pictograph_unk_addr, flag);
    }
}