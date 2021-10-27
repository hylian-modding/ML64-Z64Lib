#include "ActorSpawn.h"

#ifdef GAME_OOT
Actor* Actor_SpawnTest(ActorContext* actorCtx, GlobalContext* globalCtx, s16 actorId, f32 posX, f32 posY, f32 posZ,
                   s16 rotX, s16 rotY, s16 rotZ, s16 params) {
    register CommandEvent* commandEvent;
    s32 pad;
    Actor* actor;
    ActorInit* actorInit;
    s32 objBankIndex;
    ActorOverlay* overlayEntry;
    u32 temp;
    char* name;
    u32 overlaySize;

    overlayEntry = &gActorOverlayTable[actorId];

    name = overlayEntry->name != NULL ? overlayEntry->name : "";
    overlaySize = (u32)overlayEntry->vramEnd - (u32)overlayEntry->vramStart;

    if (actorCtx->total > ACTOR_NUMBER_MAX) {
        return NULL;
    }

    if (overlayEntry->vramStart == 0) {

        actorInit = overlayEntry->initInfo;
    } else {
        if (overlayEntry->loadedRamAddr != NULL) {
        } else {
            if (overlayEntry->allocType & ALLOCTYPE_ABSOLUTE) {

                if (actorCtx->absoluteSpace == NULL) {
                    // "AMF: absolute magic field"
                    actorCtx->absoluteSpace = ZeldaArena_MallocR(AM_FIELD_SIZE);
                }

                overlayEntry->loadedRamAddr = actorCtx->absoluteSpace;
            } else if (overlayEntry->allocType & ALLOCTYPE_PERMANENT) {
                overlayEntry->loadedRamAddr = ZeldaArena_MallocR(overlaySize);
            } else {
                overlayEntry->loadedRamAddr = ZeldaArena_Malloc(overlaySize);
            }

            if (overlayEntry->loadedRamAddr == NULL) {
                return NULL;
            }

            Overlay_Load(overlayEntry->vromStart, overlayEntry->vromEnd, overlayEntry->vramStart, overlayEntry->vramEnd,
                         overlayEntry->loadedRamAddr);

            overlayEntry->nbLoaded  = 0;
        }

        actorInit = (void*)(u32)((overlayEntry->initInfo != NULL)
                                     ? (void*)((u32)overlayEntry->initInfo -
                                               (s32)((u32)overlayEntry->vramStart - (u32)overlayEntry->loadedRamAddr))
                                     : NULL);
    }

    objBankIndex = Object_GetIndex(&globalCtx->objectCtx, actorInit->objectId);

    if ((objBankIndex < 0) ||
        ((actorInit->category == ACTORCAT_ENEMY) && Flags_GetClear(globalCtx, globalCtx->roomCtx.curRoom.num))) {
        Actor_FreeOverlay(overlayEntry);
        return NULL;
    }

    actor = ZeldaArena_Malloc(actorInit->instanceSize);

    if (actor == NULL) {
        Actor_FreeOverlay(overlayEntry);
        return NULL;
    }

    overlayEntry->nbLoaded++;

    Lib_MemSet((u8*)actor, actorInit->instanceSize, 0);
    actor->overlayEntry = overlayEntry;
    actor->id = actorInit->id;
    actor->flags = actorInit->flags;

    if (actorInit->id == ACTOR_EN_PART) {
        actor->objBankIndex = rotZ;
        rotZ = 0;
    } else {
        actor->objBankIndex = objBankIndex;
    }

    actor->init = actorInit->init;
    actor->destroy = actorInit->destroy;
    actor->update = actorInit->update;
    actor->draw = actorInit->draw;
    actor->room = globalCtx->roomCtx.curRoom.num;
    actor->home.pos.x = posX;
    actor->home.pos.y = posY;
    actor->home.pos.z = posZ;
    actor->home.rot.x = rotX;
    actor->home.rot.y = rotY;
    actor->home.rot.z = rotZ;
    actor->params = params;

    Actor_AddToCategory(actorCtx, actor, actorInit->category);

    commandEvent = CommandBuffer_CommandEvent_GetCollision(actor, COMMANDEVENTTYPE_SPAWN, COMMANDEVENTTYPE_SPAWNTRANSITION);
    if (commandEvent) {
        commandEvent->type = COMMANDEVENTTYPE_SPAWN;
        commandEvent->params.actor = actor;
    }
    else {
        commandEvent = CommandBuffer_CommandEvent_GetNext();

        if (commandEvent) {
            commandEvent->type = COMMANDEVENTTYPE_SPAWN;
            commandEvent->params.actor = actor;
            gCmdBuffer->eventCount++;
        }
    }

    temp = gSegments[6];
    Actor_Init(actor, globalCtx);
    gSegments[6] = temp;
    

    return actor;
}
#elif defined GAME_MM
Actor* Actor_SpawnTest(ActorContext* actorCtx, GlobalContext* globalCtx, int16_t index, float x, float y, float z, int16_t rotX, int16_t rotY, int16_t rotZ, int32_t params) {
    register CommandEvent* commandEvent;
    Actor* actor;
    ActorInit* actorInit;
    int32_t objBankIndex;
    uint32_t segmentAux;
    ActorOverlay* overlayEntry;

    if (actorCtx->total >= 0xFF) {
        return NULL;
    }

    actorInit = Actor_LoadOverlay(actorCtx, index);
    if (actorInit == NULL) {
        return NULL;
    }

    objBankIndex = Object_GetIndex(&globalCtx->objectCtx, actorInit->objectId);
    if ((objBankIndex < 0) || ((actorInit->category == ACTORCAT_ENEMY) && ((Flags_GetClear(globalCtx, globalCtx->roomCtx.curRoom.num) != 0)) && (actorInit->id != ACTOR_BOSS_05))) {
        Actor_FreeOverlay(&gActorOverlayTable[index]);
        return NULL;
    }

    actor = ZeldaArena_Malloc(actorInit->instanceSize);
    if (actor == NULL) {
        Actor_FreeOverlay(&gActorOverlayTable[index]);
        return NULL;
    }

    overlayEntry = &gActorOverlayTable[index];
    if (overlayEntry->vramStart != 0) {
        overlayEntry->nbLoaded++;
    }

    bzero(actor, actorInit->instanceSize);
    actor->overlayEntry = overlayEntry;
    actor->id = actorInit->id;
    actor->flags = actorInit->flags;

    if (actorInit->id == ACTOR_EN_PART) {
        actor->objBankIndex = rotZ;
        rotZ = 0;
    }
    else {
        actor->objBankIndex = objBankIndex;
    }

    actor->init = actorInit->init;
    actor->destroy = actorInit->destroy;
    actor->update = actorInit->update;
    actor->draw = actorInit->draw;
    actor->room = globalCtx->roomCtx.curRoom.num;

    actor->home.pos.x = x;
    actor->home.pos.y = y;
    actor->home.pos.z = z;
    actor->home.rot.x = rotX;
    actor->home.rot.y = rotY;
    actor->home.rot.z = rotZ;
    actor->params = params & 0xFFFF;

    actor->cutscene = (-1 & 0x7F);
    if (actor->cutscene == 0x7F) {
        actor->cutscene = -1;
    }

    actor->unk20 = 0x3FF;

    Actor_AddToCategory(actorCtx, actor, actorInit->category);

    commandEvent = CommandBuffer_CommandEvent_GetCollision(actor, COMMANDEVENTTYPE_SPAWN, COMMANDEVENTTYPE_SPAWNTRANSITION);
    if (commandEvent) {
        commandEvent->type = COMMANDEVENTTYPE_SPAWN;
        commandEvent->params.actor = actor;
    }
    else {
        commandEvent = CommandBuffer_CommandEvent_GetNext();

        if (commandEvent) {
            commandEvent->type = COMMANDEVENTTYPE_SPAWN;
            commandEvent->params.actor = actor;
            gCmdBuffer->eventCount++;
        }
    }

    segmentAux = gSegments[6];
    Actor_Init(actor, globalCtx);
    gSegments[6] = segmentAux;

    return actor;
}
#endif