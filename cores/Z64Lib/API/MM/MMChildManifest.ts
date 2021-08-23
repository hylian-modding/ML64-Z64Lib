import { IManifest } from "../Z64ManifestBuffer";
import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import { RomPatch, FilePatch } from "../FileSystemCompare";
import { Z64LibSupportedGames } from "../Z64LibSupportedGames";
import fs from 'fs';
import path from 'path';
import { Z64RomTools, trimBuffer } from "../Z64RomTools";
import { zzstatic } from "../zzstatic";
import { PatchTypes } from "modloader64_api/Patchers/PatchManager";

const OBJ_CHILD: number = 11;
const DMA_CHILD: number = 654;

export class MMChildManifest implements IManifest {

    repoint(ModLoader: IModLoaderAPI, rom: Buffer, model: Buffer): boolean {
       /*  let indexer: DMAIndexer = new DMAIndexer(Z64LibSupportedGames.MAJORAS_MASK, ModLoader, rom);
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
            indexer.tools.relocateFileToExtendedRom(rom, indexer.findIndexFromSearch(_r.finder, rom), file);
        });

        PatchTypes.get(".txt")!.patch(rom, fs.readFileSync(path.resolve(__dirname, "yaz0.txt")));
 */
        return true;
    }

    inject(ModLoader: IModLoaderAPI, rom: Buffer, model: Buffer, nocompress?: boolean): number {
        // Get original zobj from ROM.
        let r = 0;
        let tools = new Z64RomTools(ModLoader, Z64LibSupportedGames.MAJORAS_MASK);
        let zobj: Buffer = tools.decompressDMAFileFromRom(rom, DMA_CHILD);
        let originalSize: number = zobj.byteLength;
        if (model.byteLength > zobj.byteLength) {
            // This shouldn't be possible because zzplayas would throw a tantrum before you got this far.
            ModLoader.logger.error("Wtf happened here?!");
            return r;
        }
        // Clear its contents.
        ModLoader.utils.clearBuffer(zobj);
        // Load the model.
        model.copy(zobj);
        // Trim excess space.
        zobj = trimBuffer(zobj);
        // Attempt to put the file back.
        if (nocompress === undefined || nocompress === false) {
            if (!tools.recompressDMAFileIntoRom(rom, DMA_CHILD, zobj)) {
                // If we get here it means the compressed object is bigger than the original.
                // This can happen because the compression ratio ends up different due to texture differences.

                // Move the file to extended ROM space.
                r = tools.relocateFileToExtendedRom(rom, DMA_CHILD, zobj, originalSize);
                rom = PatchTypes.get(".txt")!.patch(rom, fs.readFileSync(path.join(__dirname, "../", "no_crc.txt")));
            }
        } else {
            // Move the file to extended ROM space.
            r = tools.relocateFileToExtendedRom(rom, DMA_CHILD, zobj, originalSize, nocompress);
            rom = PatchTypes.get(".txt")!.patch(rom, fs.readFileSync(path.join(__dirname, "../", "no_crc.txt")));
        }
        return r;
    }

}