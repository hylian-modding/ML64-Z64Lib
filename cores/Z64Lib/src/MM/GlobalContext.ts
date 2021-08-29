import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import * as Z64API from '../../API/imports';
import * as Z64CORE from '../importsZ64';

export class GlobalContext {

    ModLoader: IModLoaderAPI;
    viewStruct: Z64API.Z64.IViewStruct;
    instance: number = Z64CORE.Z64.Z64_GLOBAL_PTR;
    save_context: number = Z64CORE.Z64.Z64_SAVE;
    continue_state!: boolean;
    jsonFields: string[] = ['scene', 'room', 'framecount'];
    
    constructor(ModLoader: IModLoaderAPI) {
        this.ModLoader = ModLoader;
        this.viewStruct = new Z64CORE.Z64.viewStruct(ModLoader);
    }

    get scene(): number {

        return this.ModLoader.emulator.rdramReadPtr16(this.instance, 0xA4);
    }

    get scene_framecount(): number {

        return this.ModLoader.emulator.rdramReadPtr32(this.instance, 0x18840);
    }

    get room(): number {

        return this.ModLoader.emulator.rdramReadPtr8(this.instance, 0x186EC);
    }

    get liveSceneData_switch(): Buffer {

        return this.ModLoader.emulator.rdramReadPtrBuffer(this.instance, 0x01CA0 + 0x1B8, 0x10)
    }
    set liveSceneData_switch(buf: Buffer) {
        this.ModLoader.emulator.rdramWritePtrBuffer(this.instance, 0x01CA0 + 0x1B8, buf);
    }

    get liveSceneData_chests(): Buffer {

        return this.ModLoader.emulator.rdramReadPtrBuffer(this.instance, 0x01CA0 + 0x1C8, 0x4)
    }
    set liveSceneData_chests(buf: Buffer) {

        this.ModLoader.emulator.rdramWritePtrBuffer(this.instance, 0x01CA0 + 0x1C8, buf);
    }

    get liveSceneData_clear(): Buffer {

        return this.ModLoader.emulator.rdramReadPtrBuffer(this.instance, 0x01CA0 + 0x1CC, 0x4)
    }
    set liveSceneData_clear(buf: Buffer) {

        this.ModLoader.emulator.rdramWritePtrBuffer(this.instance, 0x01CA0 + 0x1CC, buf);
    }

    get liveSceneData_temp(): Buffer {

        return this.ModLoader.emulator.rdramReadPtrBuffer(this.instance, 0x01CA0 + 0x1D0, 0x4)
    }
    set liveSceneData_temp(buf: Buffer) {

        this.ModLoader.emulator.rdramWritePtrBuffer(this.instance, 0x01CA0 + 0x1D0, buf);
    }
    get liveSceneData_collectable(): Buffer {

        return this.ModLoader.emulator.rdramReadPtrBuffer(this.instance, 0x01CA0 + 0x1D4, 0x10)
    }
    set liveSceneData_collectable(buf: Buffer) {

        this.ModLoader.emulator.rdramWritePtrBuffer(this.instance, 0x01CA0 + 0x1D4, buf);
    }

    getSaveDataForCurrentScene(): Buffer {
        return this.ModLoader.emulator.rdramReadBuffer(
            this.save_context + 0x00F8 + this.scene * 0xD20,
            0x1c
        );
    }
    writeSaveDataForCurrentScene(buf: Buffer): void {
        if (buf.byteLength === 0x1c) {
            this.ModLoader.emulator.rdramWriteBuffer(
                this.save_context + 0x00F8 + this.scene * 0xD20,
                buf
            );
        }
    }
}