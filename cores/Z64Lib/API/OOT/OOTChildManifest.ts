import { IManifest } from "../Z64ManifestBuffer";
import { Z64RomTools, trimBuffer } from "../Z64RomTools";
import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import { Z64LibSupportedGames } from "../Z64LibSupportedGames";
import { PatchTypes } from 'modloader64_api/Patchers/PatchManager';
import fs from 'fs';
import path from 'path';
import { DMAIndexer } from "../DMAIndexer";
import { RomPatch, FilePatch } from "../FileSystemCompare";

const OBJ_CHILD: number = 0x0015;

export class OOTChildManifest implements IManifest {

    inject(ModLoader: IModLoaderAPI, rom: Buffer, model: Buffer) {
        // Get original zobj from ROM.
        let tools = new Z64RomTools(ModLoader, Z64LibSupportedGames.OCARINA_OF_TIME);
        let zobj: Buffer = tools.decompressObjectFileFromRom(rom, OBJ_CHILD);
        if (model.byteLength > zobj.byteLength) {
            // This shouldn't be possible because zzplayas would throw a tantrum before you got this far.
            ModLoader.logger.error("Wtf happened here?!");
            return;
        }
        // Clear its contents.
        ModLoader.utils.clearBuffer(zobj);
        // Load the model.
        model.copy(zobj);
        // Trim excess space.
        zobj = trimBuffer(zobj);
        // Attempt to put the file back.
        if (!tools.recompressObjectFileIntoRom(rom, OBJ_CHILD, zobj)) {
            // If we get here it means the compressed object is bigger than the original.
            // This can happen because the compression ratio ends up different due to texture differences.

            // Move the file to extended ROM space.
            tools.relocateFileToExtendedRom(rom, tools.findDMAIndexOfObject(rom, OBJ_CHILD), zobj, 0x37800);
        }
    }

    repoint(ModLoader: IModLoaderAPI, rom: Buffer, model: Buffer): boolean {
        let indexer: DMAIndexer = new DMAIndexer(Z64LibSupportedGames.OCARINA_OF_TIME, ModLoader, rom);
        let temp: Map<RomPatch, Buffer> = new Map<RomPatch, Buffer>();
        try {
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
            rom = PatchTypes.get(".txt")!.patch(rom, fs.readFileSync(path.join(__dirname, "../", "no_crc.txt")));
        } catch (err) {
            ModLoader.logger.error(err);
            return false;
        }

        temp.forEach((file: Buffer, _r: RomPatch) => {
            indexer.tools.recompressDMAFileIntoRom(rom, indexer.findIndexFromSearch(_r.finder, rom), file);
        });

        return true;
    }
}