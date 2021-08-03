import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import * as Z64API from '../../API/imports';
import * as Z64CORE from '../importsMM';
import { JSONTemplate } from "modloader64_api/JSONTemplate";
import IMemory from "modloader64_api/IMemory";

export class MMHelper extends JSONTemplate implements Z64API.MM.IMMHelper {

    private save: Z64API.MM.ISaveContext;
    private global: Z64API.MM.IGlobalContext;
    private link: Z64API.Z64.ILink;
    private emu: IMemory;
    constructor(
        save: Z64API.MM.ISaveContext,
        global: Z64API.MM.IGlobalContext,
        link: Z64API.Z64.ILink,
        memory: IMemory
    ) {
        super();
        this.save = save;
        this.global = global;
        this.link = link;
        this.emu = memory;
    }

    isLinkEnteringLoadingZone(): boolean {
        let r = this.link.rawStateValue;
        return (r & 0x000000ff) === 1;
    }

    isTitleScreen(): boolean {
        return this.save.checksum === 0 || !this.isSceneNumberValid();
    }

    isSceneNumberValid(): boolean {
        return this.global.current_scene <= 112;
    }

    isPaused(): boolean {
        let paused = 0x801D1500;
        return this.emu.rdramRead32(paused) !== 0x3;
    }

    isInterfaceShown(): boolean {
        let interface_shown = 0x803FD77B;
        return this.emu.rdramRead8(interface_shown) === 0xFF;
    }
}