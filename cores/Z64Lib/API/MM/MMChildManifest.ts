import { IManifest } from "Z64Lib/API/Z64ManifestBuffer";
import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import { DMAIndexer } from "Z64Lib/API/DMAIndexer";
import { RomPatch, FilePatch } from "Z64Lib/API/FileSystemCompare";
import { Z64LibSupportedGames } from "Z64Lib/API/Z64LibSupportedGames";
import fs from 'fs';
import path from 'path';
import { Z64RomTools, trimBuffer } from "Z64Lib/API/Z64RomTools";
import { zzstatic } from "../zzstatic";
import { Zobj } from "Z64Lib/API/data/zobj";
import { PatchTypes } from "modloader64_api/Patchers/PatchManager";

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
            // This is code.
            if (_r.finder === "DMA:0x1f") {
                ModLoader.logger.debug("Patching Link's object table entry...");
                file = indexer.tools.fixLinkObjectTableEntry(rom, file, Z64LibSupportedGames.MAJORAS_MASK);
                console.log(model.slice(0x5000, 0x5010));
                if (model.readUInt8(0x500B) === 0x68) {
                    console.log("ADULT LINK HEIGHT FIX");
                    file = PatchTypes.get(".txt")!.patch(file, fs.readFileSync(path.resolve(__dirname, "adult_link_physics_code.txt")));
                }
            }
            for (let j = 0; j < _r.data.length; j++) {
                let _f: FilePatch = _r.data[j];
                file.writeUInt8(_f.value, _f.offset);
            }
            temp.set(_r, file);
        }


        if (model.readUInt8(0x500B) === 0x68) {
            try {
                let r = new RomPatch(ModLoader.utils.hashBuffer(Buffer.from("DMA:0x26")));
                r.finder = "DMA:0x26";
                let ovl = indexer.tools.decompressDMAFileFromRom(rom, indexer.findIndexFromSearch(r.finder, rom));
                ovl = PatchTypes.get(".txt")!.patch(ovl, fs.readFileSync(path.resolve(__dirname, "adult_link_phhsics_playerovl.txt")));
                temp.set(r, ovl);
            } catch (err) {
                console.log(err);
                throw err;
            }
            model.writeUInt8(0x4, 0x500B);
        }

        temp.forEach((file: Buffer, _r: RomPatch) => {
            indexer.tools.relocateFileToExtendedRom(rom, indexer.findIndexFromSearch(_r.finder, rom), file);
        });

        PatchTypes.get(".txt")!.patch(rom, fs.readFileSync(path.resolve(__dirname, "yaz0.txt")));

        return true;
    }

    inject(ModLoader: IModLoaderAPI, rom: Buffer, model: Buffer): void {
        model.writeUInt32BE(0x06005420, 0x500C);
        // Get original zobj from ROM.
        let tools = new Z64RomTools(ModLoader, Z64LibSupportedGames.MAJORAS_MASK);
        let zobj: Buffer = tools.decompressDMAFileFromRom(rom, DMA_CHILD);
        // Clear its contents.
        ModLoader.utils.clearBuffer(zobj);
        // Load the model.
        let zz = new zzstatic(Z64LibSupportedGames.MAJORAS_MASK);
        let rp = zz.doRepoint(model, 0, false, 0x80A15800);
        rp.copy(model);
        ModLoader.utils.setTimeoutFrames(() => {
            ModLoader.emulator.rdramWriteBuffer(0x80A15800, rp);
        }, 20);
        model.copy(zobj);
        // Trim excess space.
        zobj = trimBuffer(zobj);
        tools.relocateFileToExtendedRom(rom, DMA_CHILD, zobj);
    }

}