import { PatchTypes } from "modloader64_api/Patchers/PatchManager";
import fs from 'fs';
import path from 'path';

export class MMRomPatches{
    patch(rom: Buffer){
        rom = PatchTypes.get(".txt")!.patch(rom, fs.readFileSync(path.resolve(__dirname, "../", "no_crc.txt")));
        rom = PatchTypes.get(".txt")!.patch(rom, fs.readFileSync(path.resolve(__dirname, "yaz0.txt")));
    }
}