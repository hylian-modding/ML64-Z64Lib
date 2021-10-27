#ifndef __HAX_EMBED_H__
#define __HAX_EMBED_H__

#include <libzelda64.h>
#include "FunctionInject.h"
#include "commandbuffer.h"

typedef struct{
    uint32_t start;
    uint32_t entryPoint;
    En_FunctionHooks funcs;
    uint32_t end;
} HaxEmbed_t;

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
        .Actor_SpawnWithParentAndCutscene = Actor_SpawnWithParentAndCutsceneCave,
        .Actor_Update = Actor_UpdateCave,
        .Object_Spawn = Object_Spawn
    },
    .end = 0xBEEFDEAD
};

#endif /* __HAX_EMBED_H__ */