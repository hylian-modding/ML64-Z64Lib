#include "HaxEmbed.h"

const HaxEmbed_t embed = {
    .start = 0xDEADBEEF,
    .entryPoint = CommandBuffer_Update,
    .funcs = {
        .Actor_Spawn = Actor_SpawnTest,
        .Actor_Destroy = Actor_DestroyCave,
        .Actor_Init = Actor_InitCave,
        .Actor_SpawnEntry = Actor_SpawnEntryCave,
        .Actor_SpawnTransition = Actor_SpawnTransitionActorCave,
        .Actor_SpawnWithAddress = Actor_SpawnWithAddress,
        .Actor_SpawnAsChildAndCutscene = Actor_SpawnWithParentAndCutsceneCave,
        .Actor_Update = Actor_UpdateCave,
        .Object_Spawn = Object_Spawn
    },
    .end = 0xBEEFDEAD
};

