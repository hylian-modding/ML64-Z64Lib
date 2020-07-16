import { Z64LibSupportedGames } from "./Z64LibSupportedGames";
import { Z64RomTools } from "./Z64RomTools";
import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";

export class DMAIndexer {

    tools: Z64RomTools;
    private map: Map<string, number> = new Map<string, number>();

    constructor(game: Z64LibSupportedGames, ModLoader: IModLoaderAPI, rom: Buffer) {
        this.tools = new Z64RomTools(ModLoader, game);
        let entries: number;
        switch (game) {
            case Z64LibSupportedGames.OCARINA_OF_TIME:
                entries = 1509;
                break;
            case Z64LibSupportedGames.MAJORAS_MASK:
                entries = 0xDEADBEEF;
                break;
        }
        for (let i = 0; i < entries; i++){
            let file: Buffer = this.tools.decompressDMAFileFromRom(rom, i);
            let hash: string = ModLoader.utils.hashBuffer(file);
            this.map.set(hash, i);
        }
        ModLoader.logger.info(this.map.size + " DMA entries hashed.");
    }

    findIndexFromHash(hash: string): number{
        if (this.map.has(hash)){
            return this.map.get(hash)!;
        }else{
            return -1;
        }
    }

    findIndexFromSearch(find: string, rom: Buffer): number{
        let split: Array<string> = find.split(":");
        switch(split[0]){
            case "DMA":
                return parseInt(split[1]);
            case "A":
                return this.tools.findDMAIndexOfActor(rom, parseInt(split[1]));
            case "E":
                return this.tools.findDMAIndexOfParticle(rom, parseInt(split[1]));
            case "O":
                return this.tools.findDMAIndexOfObject(rom, parseInt(split[1]));
        }
        return -1;
    }

}