import { onTick, Preinit, Init, Postinit, onPostTick } from "modloader64_api/PluginLifecycle";
import { IRomHeader } from 'modloader64_api/IRomHeader';
import { ModLoaderAPIInject } from "modloader64_api/ModLoaderAPIInjector";
import { IModLoaderAPI, ILogger, ICore, ModLoaderEvents } from "modloader64_api/IModLoaderAPI";
import { bus, EventHandler } from "modloader64_api/EventHandler";
import { PayloadType } from "modloader64_api/PayloadType";
import IMemory from "modloader64_api/IMemory";
import fs from 'fs';
import path from 'path';
import * as Z64API from './API/imports';
import * as Z64CORE from './src/importsMM';
import { setupMM, setupOot, Z64_GAME } from "./src/Common/types/GameAliases";
import { MajorasMask } from "./src/MajorasMask";
import { OcarinaofTime } from "./src/OcarinaofTime";
import { Z64LibSupportedGames } from "./API/Utilities/Z64LibSupportedGames";
import { PatchTypes } from 'modloader64_api/Patchers/PatchManager';

export enum ROM_VERSIONS {
    N0 = 0x00,
    GAMECUBE = 0x0f,
    REV_A = 0x01,
    REV_B = 0x02,
}
export enum ROM_REGIONS {
    NTSC_OOT = "CZL",
    NTSC_MM = "NZS"
}

export class Z64Lib implements ICore {
    header = [ROM_REGIONS.NTSC_OOT, ROM_REGIONS.NTSC_MM];
    @ModLoaderAPIInject()
    ModLoader: IModLoaderAPI = {} as IModLoaderAPI;
    eventTicks: Map<string, Function> = new Map<string, Function>();

    OOT: OcarinaofTime | undefined;
    MM: MajorasMask | undefined;

    rom_header!: IRomHeader;
    heap_start: number = 0;
    heap_size: number = 0;

    applyVersionPatch(msg: string, bps: string, target: ROM_VERSIONS) {
        this.ModLoader.logger.info(msg);
        let r = PatchTypes.get(".bps")!.patch(this.ModLoader.rom.romReadBuffer(0x0, (32 * 1024 * 1024)), fs.readFileSync(path.join(__dirname, "OOT", bps)));
        this.ModLoader.rom.romWriteBuffer(0x0, r);
        this.rom_header.revision = target;
    }

    @Preinit()
    preinit() {

        switch (this.rom_header.id) {
            case (ROM_REGIONS.NTSC_OOT):
                this.OOT = new OcarinaofTime();
                this.OOT.rom_header = this.rom_header;
                setupOot();
                break;
            case (ROM_REGIONS.NTSC_MM):
                this.MM = new MajorasMask();
                this.MM.rom_header = this.rom_header;
                setupMM();
                break;
        }

        if (this.rom_header.revision === ROM_VERSIONS.GAMECUBE && this.rom_header.id === ROM_REGIONS.NTSC_OOT) {
            // Check if its the retail Gamecube roms from the collector's edition discs or the actual debug rom.
            let rom: Buffer = this.ModLoader.rom.romReadBuffer(0x0, (32 * 1024 * 1024));
            let hash: string = this.ModLoader.utils.hashBuffer(rom);
            // Is this Master Quest?
            let mq_GC: string = "da35577fe54579f6a266931cc75f512d";
            let vanilla_GC: string = "cd09029edcfb7c097ac01986a0f83d3f";
            if (hash === mq_GC) {
                this.applyVersionPatch("Rom downgrade in progress... (Ura -> GC)", "UratoGC.bps", ROM_VERSIONS.GAMECUBE);
                this.applyVersionPatch("Rom downgrade in progress... (GC -> 1.2)", "GCtoRevB.bps", ROM_VERSIONS.REV_B);
            } else if (hash === vanilla_GC) {
                this.applyVersionPatch("Rom downgrade in progress... (GC -> 1.2)", "GCtoRevB.bps", ROM_VERSIONS.REV_B);
            }
        }
        if (this.rom_header.revision === ROM_VERSIONS.REV_B) {
            this.applyVersionPatch("Rom downgrade in progress... (1.2 -> 1.1)", "RevB.bps", ROM_VERSIONS.REV_A);
        }
        if (this.rom_header.revision === ROM_VERSIONS.REV_A) {
            this.applyVersionPatch("Rom downgrade in progress... (1.1 -> 1.0)", "RevA.bps", ROM_VERSIONS.N0);
        }

        if (Z64_GAME !== undefined) {
            this.ModLoader.logger.info('Loaded Core: ' + Z64LibSupportedGames[Z64_GAME]);
        }
        else this.ModLoader.logger.error("No core loaded! Debug[ ID: " + this.rom_header.id + " || VERSION: " + this.rom_header.revision + " || COUNTRY: " + this.rom_header.country_code + ']');
    }

    @Init()
    init(): void {
    }

    @Postinit()
    postinit(): void {

    }

    @onTick()
    onTick() {

    }

    @onPostTick()
    onPostTick() {

    }

}