import { IModLoaderAPI } from 'modloader64_api/IModLoaderAPI';
import { PayloadType } from 'modloader64_api/PayloadType';
import fs from 'fs';
import path from 'path';
import IMemory from 'modloader64_api/IMemory';
import { SmartBuffer } from 'smart-buffer';
import * as Z64API from '../API/imports';
import { Z64_OVERLAY_TABLE } from './Common/types/GameAliases';
import Vector3 from 'modloader64_api/math/Vector3';

export class OvlPayloadResult implements Z64API.Z64.IOvlPayloadResult {
    slot: number;
    core: Z64API.Z64.IZ64Core;
    size: number;
    pointer: number;

    constructor(core: Z64API.Z64.IZ64Core, slot: number, pointer: number, size: number) {
        this.slot = slot;
        this.core = core;
        this.pointer = pointer;
        this.size = size;
    }

    spawnActorRXYZ(params: number, rotX: number, rotY: number, rotZ: number, pos: Vector3, address?: number): Promise<Z64API.IActor> {
        return this.core.commandBuffer.spawnActorRXYZ(this.slot, params, rotX, rotY, rotZ, pos, address);
    }

    spawnActorRXY_Z(params: number, rotXY: number, rotZ: number, pos: Vector3, address?: number): Promise<Z64API.IActor> {
        return this.core.commandBuffer.spawnActorRXY_Z(this.slot, params, rotXY, rotZ, pos, address);
    }

    spawn(params: number, rot: Vector3, pos: Vector3, address?: number): Promise<Z64API.IActor> {
        return this.core.commandBuffer.spawnActor(this.slot, params, rot, pos, address);
    }
}

export class find_init {
    constructor() { }

    find(buf: Buffer, locate: string): number {
        let loc: Buffer = Buffer.from(locate, 'hex');
        if (buf.indexOf(loc) > -1) {
            return buf.indexOf(loc);
        }
        return -1;
    }
}
export interface ovl_meta {
    init: string;
    forceSlot: string;
}


export class OverlayPayload extends PayloadType {

    private ModLoader: IModLoaderAPI;
    private core: Z64API.Z64.IZ64Core;

    constructor(ext: string, ModLoader: IModLoaderAPI, core: Z64API.Z64.IZ64Core) {
        super(ext);
        this.ModLoader = ModLoader;
        this.core = core;
    }

    parse(file: string, buf: Buffer, dest: IMemory) {
        this.ModLoader.logger.debug('Trying to allocate actor...');
        let overlay_start: number = Z64_OVERLAY_TABLE;
        let size = 0x01d6;
        let empty_slots: number[] = new Array<number>();
        for (let i = 0; i < size; i++) {
            let entry_start: number = overlay_start + i * 0x20;
            let _i: number = dest.rdramRead32(entry_start + 0x14);
            let total = 0;
            total += _i;
            if (total === 0) {
                empty_slots.push(i);
            }
        }
        this.ModLoader.logger.debug(empty_slots.length + ' empty actor slots found.');
        let finder: find_init = new find_init();
        let meta: ovl_meta = JSON.parse(
            fs
                .readFileSync(
                    path.join(path.parse(file).dir, path.parse(file).name + '.json')
                )
                .toString()
        );
        let offset: number = finder.find(buf, meta.init);
        if (offset === -1) {
            this.ModLoader.logger.debug(
                'Failed to find spawn parameters for actor ' +
                path.parse(file).base +
                '.'
            );
            return -1;
        }
        let slot: number = empty_slots.shift() as number;
        if (meta.forceSlot !== undefined) {
            slot = parseInt(meta.forceSlot);
        }
        this.ModLoader.logger.debug(
            'Assigning ' + path.parse(file).base + ' to slot ' + slot + '.'
        );
        // Clean anything in here out first.
        for (let i = 0; i < 0x20; i++) {
            dest.rdramWrite8(slot * 0x20 + overlay_start + i, 0);
        }
        let final: number = this.core.ModLoader.gfx_heap!.malloc(buf.byteLength + 0x10);
        dest.rdramWrite32(slot * 0x20 + overlay_start + 0x14, final + offset);
        buf.writeUInt16BE(slot, offset);
        let alloc = new SmartBuffer();
        alloc.writeBuffer(buf);
        alloc.writeUInt32BE(final);
        alloc.writeUInt32BE(final + (buf.byteLength - buf.readUInt32BE(buf.byteLength - 0x4)));
        alloc.writeUInt32BE(0x80800000);
        alloc.writeUInt32BE(buf.byteLength);
        dest.rdramWriteBuffer(final, alloc.toBuffer());
        let hash: string = this.ModLoader.utils.hashBuffer(buf);
        this.ModLoader.utils.setTimeoutFrames(() => {
            this.core.commandBuffer.relocateOverlay(final, final + (buf.byteLength - buf.readUInt32BE(buf.byteLength - 0x4)), 0x80800000).then(() => {
                let hash2 = this.ModLoader.utils.hashBuffer(this.ModLoader.emulator.rdramReadBuffer(final, buf.byteLength));
                if (hash !== hash2) {
                    this.ModLoader.logger.info(`${path.parse(file).base} relocated.`);
                } else {
                    this.ModLoader.logger.error(`${path.parse(file).base} failed`);
                }
            });
        }, 20);
        return new OvlPayloadResult(this.core, slot, final, buf.byteLength);
    }
}
