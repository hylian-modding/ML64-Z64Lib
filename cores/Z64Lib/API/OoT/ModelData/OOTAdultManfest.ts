import { IManifest } from "../../Utilities/Z64ManifestBuffer";
import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import { DMAIndexer } from "../../Utilities/DMAIndexer";
import { RomPatch, FilePatch } from "../../Utilities/FileSystemCompare";
import { Z64LibSupportedGames } from "../../Utilities/Z64LibSupportedGames";
import fs from 'fs';
import path from 'path';
import { Z64RomTools, trimBuffer } from "../../Utilities/Z64RomTools";
import { zzstatic } from "../../Utilities/zzstatic";
import { PatchTypes } from "modloader64_api/Patchers/PatchManager";

export class OOTAdultManifest implements IManifest {

    inject(ModLoader: IModLoaderAPI, rom: Buffer, model: Buffer, nocompress?: boolean): number {
        let r = 0;
        // Get original zobj from ROM.
        let tools = new Z64RomTools(ModLoader, Z64LibSupportedGames.OCARINA_OF_TIME);
        let zobj: Buffer = tools.decompressObjectFileFromRom(rom, OBJ_BOY);
        let originalSize: number = zobj.byteLength;
        if (model.byteLength > zobj.byteLength) {
            // This shouldn't be possible because zzplayas would throw a tantrum before you got this far.
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
            if (!tools.recompressObjectFileIntoRom(rom, OBJ_BOY, zobj)) {
                // If we get here it means the compressed object is bigger than the original.
                // This can happen because the compression ratio ends up different due to texture differences.

                // Move the file to extended ROM space.
                r = tools.relocateFileToExtendedRom(rom, tools.findDMAIndexOfObject(rom, OBJ_BOY), zobj, originalSize);
                rom = PatchTypes.get(".txt")!.patch(rom, fs.readFileSync(path.join(__dirname, "../", "no_crc.txt")));
            }
        } else {
            // Move the file to extended ROM space.
            r = tools.relocateFileToExtendedRom(rom, tools.findDMAIndexOfObject(rom, OBJ_BOY), zobj, originalSize, nocompress);
            rom = PatchTypes.get(".txt")!.patch(rom, fs.readFileSync(path.join(__dirname, "../", "no_crc.txt")));
        }
        return r;
    }

    repoint(ModLoader: IModLoaderAPI, rom: Buffer, model: Buffer): boolean {
        let indexer: DMAIndexer = new DMAIndexer(Z64LibSupportedGames.OCARINA_OF_TIME, ModLoader, rom);
        let temp: Map<RomPatch, Buffer> = new Map<RomPatch, Buffer>();
        try {
            let rp: RomPatch[] = JSON.parse(fs.readFileSync(path.resolve(__dirname, "adult.json")).toString());
            // First loop make sure we can find everything. If not we abort.
            for (let i = 0; i < rp.length; i++) {
                let _r: RomPatch = rp[i];
                let file: Buffer = indexer.tools.decompressDMAFileFromRom(rom, indexer.findIndexFromSearch(_r.finder, rom));
                for (let j = 0; j < _r.data.length; j++) {
                    let _f: FilePatch = _r.data[j];
                    file.writeUInt8(_f.value, _f.offset);
                }
                temp.set(_r, file);

            }
        } catch (err) {
            ModLoader.logger.error(err);
            return false;
        }

        temp.forEach((file: Buffer, _r: RomPatch) => {
            if (indexer.tools.isFileCompressed(rom, indexer.findIndexFromSearch(_r.finder, rom))){
                let original = indexer.tools.decompressDMAFileFromRom(rom, indexer.findIndexFromSearch(_r.finder, rom));
                indexer.tools.relocateFileToExtendedRom(rom, indexer.findIndexFromSearch(_r.finder, rom), original, original.byteLength, true);
            }
        });

        temp.forEach((file: Buffer, _r: RomPatch) => {
            indexer.tools.recompressDMAFileIntoRom(rom, indexer.findIndexFromSearch(_r.finder, rom), file);
        });

        return true;

    }
}

const OBJ_BOY: number = 0x0014;