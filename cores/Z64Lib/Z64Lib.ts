import { ICore, IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import { IRomHeader } from "modloader64_api/IRomHeader";
import { ExternalAPIProvider } from 'modloader64_api/ExternalAPIProvider';
import path from 'path';

const version: string = require('./package.json').version;

@ExternalAPIProvider("Z64Lib", version, path.resolve(__dirname))
export class Z64Lib implements ICore{

    header: string | string[] = "This is a dummy";
    ModLoader!: IModLoaderAPI;
    rom_header?: IRomHeader | undefined;
    heap_start: number = -1;
    heap_size: number = -1;
    preinit(): void {
    }
    init(): void {
    }
    postinit(): void {
    }
    onTick(frame?: number): void {
    }
}