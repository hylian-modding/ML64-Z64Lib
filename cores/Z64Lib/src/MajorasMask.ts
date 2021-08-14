import { onTick, Preinit, Init, Postinit, onPostTick } from "modloader64_api/PluginLifecycle";
import { IRomHeader } from 'modloader64_api/IRomHeader';
import { ModLoaderAPIInject } from "modloader64_api/ModLoaderAPIInjector";
import { IModLoaderAPI, ILogger, ICore, ModLoaderEvents } from "modloader64_api/IModLoaderAPI";
import { bus, EventHandler, EventsClient } from "modloader64_api/EventHandler";
import { PayloadType } from "modloader64_api/PayloadType";
import IMemory from "modloader64_api/IMemory";
import fs from 'fs';
import path from 'path';
import * as Z64API from '../API/imports';
import * as Z64CORE from './importsMM';
import { ROM_REGIONS } from "../Z64Lib";

export class MajorasMask implements ICore, Z64API.MM.IMMCore {
    header = [ROM_REGIONS.NTSC_MM];
    @ModLoaderAPIInject()
    ModLoader: IModLoaderAPI = {} as IModLoaderAPI;
    eventTicks: Map<string, Function> = new Map<string, Function>();
    link!: Z64API.Z64.ILink;
    save!: Z64API.MM.ISaveContext;
    global!: Z64API.MM.IGlobalContext;
    helper!: Z64API.MM.IMMHelper;
    commandBuffer!: Z64CORE.CommandBuffer;
    photo!: Z64API.MM.IPhoto;
    skull!: Z64API.MM.ISkull;
    stray!: Z64API.MM.IStray;
    // Client side variables
    isSaveLoaded = false;
    isPaused = false;
    last_known_scene = -1;
    last_known_room = -1;
    doorcheck = false;
    touching_loading_zone = false;
    frame_count_reset_scene = -1;
    last_known_age!: number;
    log!: ILogger;
    actorManager!: Z64API.Z64.IActorManager;
    payloads: string[] = new Array<string>();
    inventory_cache: Buffer = Buffer.alloc(0x18, 0xff);

    constructor() {
    }
    rom_header?: IRomHeader | undefined;

    heap_start: number = 0;
    heap_size: number = 0;

    @Preinit()
    preinit() {

    }

    
    @EventHandler(ModLoaderEvents.ON_SOFT_RESET_PRE)
    onReset1(evt: any) {
        this.isSaveLoaded = false;
    }

    @EventHandler(ModLoaderEvents.ON_SOFT_RESET_POST)
    onReset2(evt: any) {
        this.isSaveLoaded = false;
    }
    
    @Init()
    init(): void {
        this.eventTicks.set('waitingForSaveload', () => {
            if (!this.isSaveLoaded && this.helper.isSceneNumberValid() && !this.helper.isTitleScreen()) {
                this.isSaveLoaded = true;
                bus.emit(Z64API.MM.MMEvents.ON_SAVE_LOADED, {});
            }
        });
    }

    @Postinit()
    postinit(): void {

        this.global = new Z64CORE.GlobalContext(this.ModLoader);
        this.link = new Z64CORE.Link(this.ModLoader.emulator);
        this.save = new Z64CORE.SaveContext(this.ModLoader.emulator, this.ModLoader.logger, this);
        this.helper = new Z64CORE.MMHelper(
            this.save,
            this.global,
            this.link,
            this.ModLoader.emulator
        );
        this.photo = new Z64CORE.Photo(this.ModLoader.emulator, this.save);
        this.stray = new Z64CORE.Stray(this.ModLoader.emulator, this.save);
        this.skull = new Z64CORE.Skull(this.ModLoader.emulator, this.save);
        this.actorManager = new Z64CORE.ActorManager();
    }

    @onTick()
    onTick() {

        //this.commandBuffer.onTick();

        if (this.helper.isTitleScreen() || !this.helper.isSceneNumberValid()) return;
        
        // Loading zone check
        if (this.helper.isLinkEnteringLoadingZone() && !this.touching_loading_zone) {
            bus.emit(Z64API.MM.MMEvents.ON_LOADING_ZONE, {});
            this.touching_loading_zone = true;
        }
        // Scene change check
        if (
            this.global.scene_framecount === 1
        ) {
            this.last_known_scene = this.global.current_scene;
            bus.emit(Z64API.MM.MMEvents.ON_SCENE_CHANGE, this.last_known_scene);
            this.touching_loading_zone = false;
        }
        // Age check
        if (this.save.form !== this.last_known_age){
            this.last_known_age = this.save.form;
            bus.emit(Z64API.MM.MMEvents.ON_AGE_CHANGE, this.last_known_age);
        }

        // UnPause Check
        if(this.helper.isPaused()){
            this.isPaused = true;
        }
        else if(!this.helper.isPaused() && this.isPaused){
            this.isPaused = false;
            bus.emit(Z64API.MM.MMEvents.ON_UNPAUSE);
        }
        
        this.eventTicks.forEach((value: Function, key: string) => {
            value();
        });
    }
    
    @onPostTick()
    onPostTick() {
        this.link.current_sound_id = 0;
    }
    
    @EventHandler(EventsClient.ON_HEAP_READY)
    onHeapReady(evt: any) {
        //this.commandBuffer = new Z64CORE.CommandBuffer(this.ModLoader, this.rom_header!.revision);
    }
    
}