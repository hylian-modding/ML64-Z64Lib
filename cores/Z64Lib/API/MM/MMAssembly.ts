import { IInjectedAssembly } from "../Common/IInjectedAssembly";
import { CommandBuffer_mm } from "./CommandBuffer_mm";

export class MMAssembly implements IInjectedAssembly {

    commandBuffer: Buffer = CommandBuffer_mm;

    VERSIONS: Map<number, Map<string, number>> = new Map([
        [
            0,
            new Map<string, number>([
                ["Actor_DestroyCave", 0x800B6968],
                ["Actor_InitCave", 0xDEADBEEF],
                ["Actor_SpawnEntryCave", 0x800B92D8],
                ["Actor_SpawnEntryCave2", 0x800B9430],
                ["Actor_SpawnTransitionActorCave", 0x800BB140],
                ["Actor_UpdateCave", 0x800B9744],
                ["Actor_SpawnCave", 0x800BAC60],
                ["Actor_SpawnWithParentAndCutsceneCave", 0x800BAE14],
                ["CommandBuffer_Update", 0x801737A0],
                ["Object_SpawnCave", 0xDEADBEEF],
                ["SuperDynaPoly_AllocPolyList", 0xDEADBEEF],
                ["SuperDynaPoly_AllocVtxList", 0xDEADBEEF],
                ["SuperDynaSSNodeList_Alloc", 0xDEADBEEF],
                ["Overlay_Relocate", 0x800849A0]
            ]),
        ],
    ]);
}

export const MMAssemblyBuffers: IInjectedAssembly = new MMAssembly();
