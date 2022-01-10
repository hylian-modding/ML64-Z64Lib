import { bus, EventHandler, EventsClient } from 'modloader64_api/EventHandler';
import { ICore, IModLoaderAPI, ModLoaderEvents } from 'modloader64_api/IModLoaderAPI';
import { IRomHeader } from 'modloader64_api/IRomHeader';
import { onPostTick } from 'modloader64_api/PluginLifecycle';
import * as Z64API from '../API/imports';
import * as Z64CORE from './importsZ64';
import { ROM_REGIONS, ROM_VERSIONS } from './Z64Lib';
import { ModLoaderAPIInject } from 'modloader64_api/ModLoaderAPIInjector';
import { Z64_GAME, Z64_GLOBAL_PTR, Z64_SAVE } from './Common/types/GameAliases';
import { EventSystem } from './Common/CommandBuffer/EventSystem';
import { OverlayPayload } from './OverlayPayload';
import { IActorManager } from '@Z64Lib/API/Common/Z64API';
import MessageContext from './OoT/MessageContext';
import { OOTDBG_GAME } from './Common/types/OotAliases';

export interface OOT_Offsets {
    state: number;
    state2: number;
    paused: number;
    raw_anim: number;
    dma_rom: number;
}

export class OcarinaofTime implements ICore, Z64API.OoT.IOOTCore, Z64API.Z64.IZ64Core {
    header = [ROM_REGIONS.NTSC_OOT];
    @ModLoaderAPIInject()
    ModLoader!: IModLoaderAPI;
    link!: Z64API.Z64.ILink
    save!: Z64CORE.OoT.SaveContext;
    global!: Z64API.OoT.IGlobalContext;
    helper!: Z64API.OoT.IOotHelper;
    commandBuffer!: Z64CORE.Z64.CommandBuffer;
    actorManager!: IActorManager;
    msgCtx!: Z64API.OoT.IMessageContext;
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
    heap_start: number = 0x0;
    heap_size: number = 0x0;
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
        this.global = new Z64CORE.OoT.GlobalContext(this.ModLoader);
        this.link = new Z64CORE.OoT.Link(this.ModLoader.emulator, this.ModLoader.math);
        this.save = new Z64CORE.OoT.SaveContext(this.ModLoader, this.ModLoader.logger);
        this.helper = new Z64CORE.OoT.OotHelper(
            this.save,
            this.global,
            this.link,
            this.ModLoader.emulator
        );
        this.ModLoader.payloadManager.registerPayloadType(
            new OverlayPayload('.ovl', this.ModLoader, this)
        );
    }

    onTick(frame: number): void {
        if (this.map_select_enabled) {
            this.mapSelectCode();
        }
        if (this.commandBuffer !== undefined) this.commandBuffer.onTick();
        //@ts-ignore
        if (this.actorManager !== undefined) this.actorManager.onTick();
        if (!this.helper.isTitleScreen()) {
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
        /*         if (this.ModLoader.config.data["OcarinaofTime"]["skipN64Logo"]) {
                    this.ModLoader.logger.info("Skipping N64 logo screen...");
                    this.ModLoader.emulator.rdramWritePtr8(Z64_GLOBAL_PTR, 0x1E1, 0x1);
                } */
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
        this.heap_start = 0x81000000;
        this.heap_size = 0x2E00000;
        this.ModLoader.logger.debug(`Oot Core Context: ${this.heap_start.toString(16)}. Size: 0x${this.heap_size.toString(16)}`);
        this.ModLoader.logger.debug(`Oot GFX Context: ${gfx_heap_start.toString(16)}. Size: 0x${gfx_heap_size.toString(16)}`);
    }

    @EventHandler(EventsClient.ON_HEAP_READY)
    onHeapReady(evt: any) {
        if (Z64_GAME !== OOTDBG_GAME) {
            this.commandBuffer = new Z64CORE.Z64.CommandBuffer(this.ModLoader, this.rom_header.revision, Z64_GAME, this);
            this.actorManager = new EventSystem(this.ModLoader, this, this.commandBuffer.cmdbuf);
        }
        let MessageContextPtr = this.ModLoader.emulator.rdramRead32(Z64_GLOBAL_PTR) + 0x0020D8;
        this.msgCtx = new MessageContext(this, this.ModLoader, MessageContextPtr);
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
