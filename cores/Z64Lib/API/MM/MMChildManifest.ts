import { IManifest } from "Z64Lib/API/Z64ManifestBuffer";
import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import { DMAIndexer } from "Z64Lib/API/DMAIndexer";
import { RomPatch, FilePatch } from "Z64Lib/API/FileSystemCompare";
import { Z64LibSupportedGames } from "Z64Lib/API/Z64LibSupportedGames";
import fs from 'fs';
import path from 'path';
import { PatchTypes } from "modloader64_api/Patchers/PatchManager";
import { Z64RomTools, trimBuffer } from "Z64Lib/API/Z64RomTools";
import { zzstatic } from "../zzstatic";
import { Zobj } from "Z64Lib/API/data/zobj";

const OBJ_CHILD: number = 11;
const DMA_CHILD: number = 654;

export class MMChildManifest implements IManifest {

    repoint(ModLoader: IModLoaderAPI, rom: Buffer, model: Buffer): boolean {
        let indexer: DMAIndexer = new DMAIndexer(Z64LibSupportedGames.MAJORAS_MASK, ModLoader, rom);
        let temp: Map<RomPatch, Buffer> = new Map<RomPatch, Buffer>();

        let rp: RomPatch[] = JSON.parse(fs.readFileSync(path.resolve(__dirname, "child.json")).toString());
        for (let i = 0; i < rp.length; i++) {
            let _r: RomPatch = rp[i];
            let file: Buffer = indexer.tools.decompressDMAFileFromRom(rom, indexer.findIndexFromSearch(_r.finder, rom));
            for (let j = 0; j < _r.data.length; j++) {
                let _f: FilePatch = _r.data[j];
                file.writeUInt8(_f.value, _f.offset);
            }
            temp.set(_r, file);
        }
        
        temp.forEach((file: Buffer, _r: RomPatch) => {
            //indexer.tools.recompressDMAFileIntoRom(rom, indexer.findIndexFromSearch(_r.finder, rom), file);
            indexer.tools.relocateFileToExtendedRom(rom, indexer.findIndexFromSearch(_r.finder, rom), file, 0, true);
        });
        fs.writeFileSync(global.ModLoader.startdir + "/test.z64", rom);
        return true;
    }

    inject(ModLoader: IModLoaderAPI, rom: Buffer, model: Buffer): void {
        // Get original zobj from ROM.
        let tools = new Z64RomTools(ModLoader, Z64LibSupportedGames.MAJORAS_MASK);
        let zobj: Buffer = tools.decompressDMAFileFromRom(rom, DMA_CHILD);
        // Clear its contents.
        ModLoader.utils.clearBuffer(zobj);
        // Resize
        zobj = Buffer.alloc(220 * 1024);
        // Load the model.
        model.copy(zobj);
        // Trim excess space.
        //zobj = trimBuffer(zobj);
        tools.relocateFileToExtendedRom(rom, DMA_CHILD, zobj, zobj.byteLength, true);
    }

}