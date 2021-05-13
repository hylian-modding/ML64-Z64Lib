import { Z64LibSupportedGames } from "./Z64LibSupportedGames";
import { Z64RomTools } from "./Z64RomTools";
import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";

export class DMAIndexer {

    tools: Z64RomTools;

    constructor(game: Z64LibSupportedGames, ModLoader: IModLoaderAPI, rom: Buffer) {
        this.tools = new Z64RomTools(ModLoader, game);
    }

    findIndexFromSearch(find: string, rom: Buffer): number {
        let split: Array<string> = find.split(":");
        switch (split[0]) {
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