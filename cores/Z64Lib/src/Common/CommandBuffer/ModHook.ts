import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";

export default class ModHook {

    static MODHOOK_ADDR: number = -1;
    static MODHOOK_SIZE: number = 0x10;

    static addHook(ModLoader: IModLoaderAPI, n: number) {
        for (let i = 0; i < this.MODHOOK_SIZE; i++) {
            let offset = i * 0x4;
            let addr = this.MODHOOK_ADDR + offset;
            console.log(addr.toString(16));
            if (ModLoader.emulator.rdramRead32(addr) === 0) {
                ModLoader.emulator.rdramWrite32(addr, n);
                break;
            }
        }
    }

    static removeHook(ModLoader: IModLoaderAPI, n: number) {
        for (let i = 0; i < this.MODHOOK_SIZE; i++) {
            let offset = i * 0x4;
            let addr = this.MODHOOK_ADDR + offset;
            if (ModLoader.emulator.rdramRead32(addr) > 0) {
                if (ModLoader.emulator.rdramRead32(addr) === n) {
                    ModLoader.emulator.rdramWrite32(addr, 0);
                    break;
                }
            }
        }
    }

}