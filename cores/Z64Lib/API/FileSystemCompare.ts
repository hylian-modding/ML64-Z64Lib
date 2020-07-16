import { Z64RomTools } from "./Z64RomTools";
import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import fse from 'fs-extra';
import path from 'path';
import { Z64LibSupportedGames } from "./Z64LibSupportedGames";

export class FilePatch {
    offset: number;
    value: number;
  
    constructor(offset: number, value: number) {
      this.offset = offset;
      this.value = value;
    }
  }
  
  export class RomPatch {
    finder: string = "";
    hash: string;
    data: FilePatch[] = new Array<FilePatch>();
  
    constructor(hash: string) {
      this.hash = hash;
    }
  }

export class FileSystemCompare{
    
    ModLoader: IModLoaderAPI;

    constructor(ModLoader: IModLoaderAPI){
        this.ModLoader = ModLoader;
    }

    dumpVanilla(rom: Buffer){
        let tools: Z64RomTools = new Z64RomTools(this.ModLoader, Z64LibSupportedGames.OCARINA_OF_TIME);
        let total: number = 1509;
        let target: string = global.ModLoader["startdir"] + "/vanilla";
        if (fse.existsSync(target)){
            fse.removeSync(target);
        }
        if (!fse.existsSync(target)){
            fse.mkdirSync(target);
        }
        for (let i = 0; i < total; i++){
            console.log(i);
            let buf: Buffer = tools.decompressDMAFileFromRom(rom, i);
            fse.writeFileSync(path.join(target, i + ".bin"), buf);
        }
    }

    dumpDirty(rom: Buffer){
        let tools: Z64RomTools = new Z64RomTools(this.ModLoader, Z64LibSupportedGames.OCARINA_OF_TIME);
        let total: number = 1509;
        let target: string = global.ModLoader["startdir"] + "/dirty";
        if (fse.existsSync(target)){
            fse.removeSync(target);
        }
        if (!fse.existsSync(target)){
            fse.mkdirSync(target);
        }
        for (let i = 0; i < total; i++){
            console.log(i);
            let buf: Buffer = tools.decompressDMAFileFromRom(rom, i);
            fse.writeFileSync(path.join(target, i + ".bin"), buf);
        }
    }

    compare(ModLoader: IModLoaderAPI, o = "out.json"){
        let v: string = global.ModLoader["startdir"] + "/vanilla";
        let d: string = global.ModLoader["startdir"] + "/dirty";
        let dest: string = global.ModLoader["startdir"] + "/patches";
        if (!fse.existsSync(dest)){
            fse.mkdirSync(dest);
        }
        let total: number = 1509;
        let patches: any = {};
        for (let i = 3; i < total; i++){
            if (i === 502 || i === 503){
                continue;
            }
            let buf1: Buffer = fse.readFileSync(path.join(v, i + ".bin"));
            let buf2: Buffer = fse.readFileSync(path.join(d, i + ".bin"));
            for (let j = 0; j < buf1.byteLength; j++){
                if (buf1[j] !== buf2[j]){
                    if (!patches.hasOwnProperty(i)){
                        patches[i] = new RomPatch(ModLoader.utils.hashBuffer(buf1));
                        console.log(i);
                    }
                    (patches[i] as RomPatch).finder = "DMA:0x" + i.toString(16);
                    (patches[i] as RomPatch).data.push(new FilePatch(j, buf2[j]));
                }
            }
        }
        let rp: RomPatch[] = [];
        Object.keys(patches).forEach((key: string)=>{
            rp.push(patches[key]);
        });
        fse.writeFileSync(path.join(dest, o), JSON.stringify(rp, null, 2));
    }
}