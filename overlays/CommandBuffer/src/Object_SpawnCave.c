#include "Object_SpawnCave.h"

#ifdef GAME_OOT
s32 Object_SpawnCave(ObjectContext* objectCtx, s16 objectId) {
    u32 size;

    objectCtx->status[objectCtx->num].id = objectId;
    size = gObjectTable[objectId].vromEnd - gObjectTable[objectId].vromStart;

    DmaMgr_SendRequest0(objectCtx->status[objectCtx->num].segment, gObjectTable[objectId].vromStart, size);

    if (objectCtx->num < OBJECT_EXCHANGE_BANK_MAX - 1) {
        objectCtx->status[objectCtx->num + 1].segment =
            (void*)ALIGN16((s32)objectCtx->status[objectCtx->num].segment + size);
    }

    objectCtx->num++;
    objectCtx->mainKeepNum = objectCtx->num;

    return objectCtx->num - 1;
}
#elif defined GAME_MM
s32 Object_SpawnCave(ObjectContext* objectCtx, s16 objectId) {}
#endif

