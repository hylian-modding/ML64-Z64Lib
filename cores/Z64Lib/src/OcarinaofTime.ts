import { bus, EventHandler, EventsClient } from 'modloader64_api/EventHandler';
import { ICore, IModLoaderAPI, ModLoaderEvents } from 'modloader64_api/IModLoaderAPI';
import { IRomHeader } from 'modloader64_api/IRomHeader';
import { PayloadType } from 'modloader64_api/PayloadType';
import fs from 'fs';
import path from 'path';
import IMemory from 'modloader64_api/IMemory';
import { onPostTick } from 'modloader64_api/PluginLifecycle';
import { SmartBuffer } from 'smart-buffer';
import Vector3 from 'modloader64_api/math/Vector3';
import * as Z64API from '../API/imports';
import * as Z64CORE from './importsOOT';
import { ROM_REGIONS, ROM_VERSIONS } from './Z64Lib';
import { ModLoaderAPIInject } from 'modloader64_api/ModLoaderAPIInjector';
import { Z64_GAME, Z64_GLOBAL_PTR, Z64_OVERLAY_TABLE, Z64_SAVE } from './Common/types/GameAliases';
import { EventSystem } from './OoT/EventSystem';

export interface OOT_Offsets {
    state: number;
    state2: number;
    paused: number;
    raw_anim: number;
    dma_rom: number;
}

export class OcarinaofTime implements ICore, Z64API.OoT.IOOTCore {
    header = [ROM_REGIONS.NTSC_OOT];
    @ModLoaderAPIInject()
    ModLoader!: IModLoaderAPI;
    link!: Z64API.Z64.ILink
    save!: Z64CORE.SaveContext;
    global!: Z64API.OoT.IGlobalContext;
    helper!: Z64API.OoT.IOotHelper;
    commandBuffer!: Z64CORE.CommandBuffer;
    actorManager!: Z64CORE.ActorManager;
    eventTicks: Map<string, Function> = new Map<string, Function>();
    // Client side variables
    isSaveLoaded = false;
    last_known_scene = -1;
    last_known_room = -1;
    doorcheck = false;
    touching_loading_zone = false;
    frame_count_reset_scene = -1;
    rom_header!: IRomHeader;
    inventory_cache: Buffer = Buffer.alloc(0x24, 0xff);
    last_known_age!: number;
    map_select_enabled: boolean = false;
    localFlags: Buffer = Buffer.alloc(0x1c);
    localFlagsTemp: Buffer = Buffer.alloc(0x1c);
    localFlagsHash: string = "";
    permFlagsScene: Buffer = Buffer.alloc(0xb0c);
    permFlagsSceneHash: string = "";
    heap_start: number = 0x80700000;
    heap_size: number = 0x00900000;
    isNight: boolean = false;
    lastHealth: number = 0;
    lastTunic: Z64API.OoT.Tunic = Z64API.OoT.Tunic.KOKIRI;

    preinit(): void {
        this.ModLoader.config.registerConfigCategory("OcarinaofTime");
        this.ModLoader.config.setData("OcarinaofTime", "skipN64Logo", true);
        this.ModLoader.config.save();
        this.ModLoader.logger.info('OOT VERSION: ' + ROM_VERSIONS[this.rom_header.revision] + '.');
    }

    @EventHandler(ModLoaderEvents.ON_SOFT_RESET_PRE)
    onReset1(evt: any) {
        this.isSaveLoaded = false;
    }

    @EventHandler(ModLoaderEvents.ON_SOFT_RESET_POST)
    onReset2(evt: any) {
        this.isSaveLoaded = false;
    }

    init(): void {
        this.eventTicks.set('waitingForAgeChange', () => {
            if (this.save.age !== this.last_known_age) {
                bus.emit(Z64API.OoT.OotEvents.ON_AGE_CHANGE, this.save.age);
                this.last_known_age = this.save.age;
            }
        });
        this.eventTicks.set('waitingForSaveload', () => {
            if (!this.isSaveLoaded && this.helper.isSceneNumberValid()) {
                this.isSaveLoaded = true;
                bus.emit(Z64API.OoT.OotEvents.ON_SAVE_LOADED, {});
            }
        });
        this.eventTicks.set('waitingForLoadingZoneTrigger', () => {
            if (
                this.helper.isLinkEnteringLoadingZone() &&
                !this.touching_loading_zone
            ) {
                bus.emit(Z64API.OoT.OotEvents.ON_LOADING_ZONE, {});
                this.touching_loading_zone = true;
            }
        });
        this.eventTicks.set('waitingForFrameCount', () => {
            if (
                this.global.scene_framecount === 1 &&
                !this.helper.isTitleScreen() &&
                this.helper.isSceneNumberValid()
            ) {
                let cur = this.global.scene;
                this.last_known_scene = cur;
                bus.emit(Z64API.OoT.OotEvents.ON_SCENE_CHANGE, this.last_known_scene);
                this.touching_loading_zone = false;
                let inventory: Buffer = this.ModLoader.emulator.rdramReadBuffer(
                    Z64_SAVE + 0x0074,
                    0x24
                );
                for (let i = 0; i < inventory.byteLength; i++) {
                    if (inventory[i] === 0x004d) {
                        inventory[i] = this.inventory_cache[i];
                    }
                }
                inventory.copy(this.inventory_cache);
                this.ModLoader.emulator.rdramWriteBuffer(
                    Z64_SAVE + 0x0074,
                    inventory
                );
            }
        });
        this.eventTicks.set('waitingForRoomChange', () => {
            let cur = this.global.room;
            if (this.last_known_room !== cur) {
                this.last_known_room = cur;
                bus.emit(Z64API.OoT.OotEvents.ON_ROOM_CHANGE, this.last_known_room);
                this.doorcheck = false;
            }
            let doorState = this.ModLoader.emulator.rdramReadPtr8(
                Z64_GLOBAL_PTR,
                0x11ced
            );
            if (doorState === 1 && !this.doorcheck) {
                bus.emit(Z64API.OoT.OotEvents.ON_ROOM_CHANGE_PRE, doorState);
                this.doorcheck = true;
            }
        });
        this.eventTicks.set('nightTick', () => {
            if (!this.isNight && this.save.world_night_flag) {
                this.isNight = true;
                bus.emit(Z64API.OoT.OotEvents.ON_NIGHT_TRANSITION, this.isNight);
            } else if (this.isNight && !this.save.world_night_flag) {
                this.isNight = false;
                bus.emit(Z64API.OoT.OotEvents.ON_DAY_TRANSITION, this.isNight);
            }
        });
        this.eventTicks.set('healthTick', () => {
            if (this.lastHealth !== this.save.health) {
                this.lastHealth = this.save.health;
                bus.emit(Z64API.OoT.OotEvents.ON_HEALTH_CHANGE, this.lastHealth);
            }
        });
        this.eventTicks.set('tunicTick', () => {
            if (this.lastTunic !== this.link.tunic) {
                this.lastTunic = this.link.tunic;
                bus.emit(Z64API.OoT.OotEvents.ON_TUNIC_CHANGE, this.lastTunic);
            }
        });
    }

    postinit(): void {
        this.global = new Z64CORE.GlobalContext(this.ModLoader);
        this.link = new Z64CORE.Link(this.ModLoader.emulator, this.ModLoader.math);
        this.save = new Z64CORE.SaveContext(this.ModLoader, this.ModLoader.logger);
        this.helper = new Z64CORE.OotHelper(
            this.save,
            this.global,
            this.link,
            this.ModLoader.emulator
        );
        this.actorManager = new Z64CORE.ActorManager();
        this.ModLoader.payloadManager.registerPayloadType(
            new OverlayPayload('.ovl', this.ModLoader, this)
        );
    }

    onTick(frame: number): void {
        if (this.map_select_enabled) {
            this.mapSelectCode();
        }
        if (!this.helper.isTitleScreen()) {
            if (this.commandBuffer !== undefined) this.commandBuffer.onTick();
            this.eventTicks.forEach((value: Function, key: string) => {
                value();
            });
        }
    }

    @onPostTick()
    onPostTick() {
        this.link.current_sound_id = 0;
    }

    @EventHandler(EventsClient.ON_INJECT_FINISHED)
    onInject(evt: any) {
        if (this.ModLoader.config.data["OcarinaofTime"]["skipN64Logo"]) {
            this.ModLoader.logger.info("Skipping N64 logo screen...");
            this.ModLoader.emulator.rdramWritePtr8(Z64_GLOBAL_PTR, 0x1E1, 0x1);
        }
    }

    @EventHandler(EventsClient.ON_HEAP_SETUP)
    onHeapSetup(evt: any) {
        // Scan memory.
        let mb_1: Buffer = Buffer.alloc(0x100000);
        let start: number = 0x80000000;
        let scan: Buffer = Buffer.alloc(0x100000, 0xFF);
        let skipped: number = 0;
        while (!scan.equals(mb_1)) {
            start += (0x100000);
            skipped += (0x100000);
            scan = this.ModLoader.emulator.rdramReadBuffer(start, 0x100000);
        }
        let gfx_heap_start = start;
        let gfx_heap_size = (0x1000000 - skipped);
        evt["gfx_heap_start"] = gfx_heap_start;
        evt["gfx_heap_size"] = gfx_heap_size;
        this.ModLoader.logger.debug(`Oot Core Context: ${this.heap_start.toString(16)}. Size: 0x${this.heap_size.toString(16)}`);
        this.ModLoader.logger.debug(`Oot GFX Context: ${gfx_heap_start.toString(16)}. Size: 0x${gfx_heap_size.toString(16)}`);
    }

    @EventHandler(EventsClient.ON_HEAP_READY)
    onHeapReady(evt: any) {
        this.commandBuffer = new Z64CORE.CommandBuffer(this.ModLoader, this.rom_header.revision, Z64_GAME);
        this.actorManager = new EventSystem(this.ModLoader, this.commandBuffer.cmdbuf);
    }

    mapSelectCode(): void {
        this.ModLoader.emulator.rdramWrite32(0x800F1434, 0x00B9E400);
        this.ModLoader.emulator.rdramWrite32(0x800F1438, 0x00BA1160);
        this.ModLoader.emulator.rdramWrite32(0x800F143C, 0x808009C0);
        this.ModLoader.emulator.rdramWrite32(0x800F1440, 0x80803720);
        this.ModLoader.emulator.rdramWrite32(0x800F1448, 0x80801C14);
        this.ModLoader.emulator.rdramWrite32(0x800F144C, 0x80801C08);
        if (this.ModLoader.emulator.rdramRead16(0x800F1430) === 0x803B) {
            this.ModLoader.emulator.rdramWrite8(0x8011B92F, 0);
        }
        if (this.ModLoader.emulator.rdramRead16(0x801C84B4) === 0x2030) {
            this.ModLoader.emulator.rdramWrite8(0x8011B92F, 0x0002);
            this.ModLoader.emulator.rdramWrite16(0x801DA2B4, 0x0EC0);
        }
    }

    toggleMapSelectKeybind(): boolean {
        this.map_select_enabled = true;
        return true;
    }
}

class find_init {
    constructor() { }

    find(buf: Buffer, locate: string): number {
        let loc: Buffer = Buffer.from(locate, 'hex');
        if (buf.indexOf(loc) > -1) {
            return buf.indexOf(loc);
        }
        return -1;
    }
}

interface ovl_meta {
    init: string;
    forceSlot: string;
}

class OvlPayloadResult implements Z64API.Z64.IOvlPayloadResult {
    slot: number;
    core: Z64API.OoT.IOOTCore;

    constructor(core: Z64API.OoT.IOOTCore, slot: number) {
        this.slot = slot;
        this.core = core;
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

export class OverlayPayload extends PayloadType {

    private ModLoader: IModLoaderAPI;
    private core: Z64API.OoT.IOOTCore;

    constructor(ext: string, ModLoader: IModLoaderAPI, core: Z64API.OoT.IOOTCore) {
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
        let final: number = this.core.ModLoader.heap!.malloc(buf.byteLength + 0x10);
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
        this.ModLoader.utils.setTimeoutFrames(()=>{
            this.core.commandBuffer.relocateOverlay(final, final + (buf.byteLength - buf.readUInt32BE(buf.byteLength - 0x4)), 0x80800000).then(()=>{
                let hash2 = this.ModLoader.utils.hashBuffer(this.ModLoader.emulator.rdramReadBuffer(final, buf.byteLength));
                if (hash !== hash2) {
                    this.ModLoader.logger.info(`${path.parse(file).base} relocated.`);
                } else {
                    this.ModLoader.logger.error(`${path.parse(file).base} failed`);
                }
            });
        }, 20);
        return new OvlPayloadResult(this.core, slot);
    }
}
