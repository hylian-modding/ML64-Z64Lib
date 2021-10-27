import { IInjectedAssembly } from "../Common/IInjectedAssembly";
import { CommandBuffer_oot } from "./CommandBuffer_oot";

class OOTAssembly implements IInjectedAssembly {

    commandBuffer: Buffer = CommandBuffer_oot;

    VERSIONS: Map<number, Map<string, number>> = new Map([
        [
            0,
            new Map<string, number>([
                ["Actor_DestroyCave", 0x80021104],
                ["Actor_InitCave", 0x800253c8],
                ["Actor_SpawnEntryCave", 0x80023de8],
                ["Actor_SpawnTransitionActorCave", 0x8002557c],
                ["Actor_UpdateCave", 0x800240d8],
                ["Actor_SpawnCave", 0x80025110],
                ["CommandBuffer_Update", 0x800a0bf8],
                ["Object_SpawnCave", 0x800812F0],
                ["SuperDynaPoly_AllocPolyList", 0x8003133C],
                ["SuperDynaPoly_AllocVtxList", 0x80031358],
                ["SuperDynaSSNodeList_Alloc", 0x80031378],
                ["Overlay_Relocate", 0x800CC8F0]
            ]),
        ],
    ]);
}

export const OOTAssemblyBuffers: IInjectedAssembly = new OOTAssembly();