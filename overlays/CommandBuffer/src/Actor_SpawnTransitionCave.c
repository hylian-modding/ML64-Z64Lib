#include "Actor_SpawnTransitionCave.h"

static void Actor_SpawnEvent(Actor* thisx) {
    register CommandEvent* commandEvent = NULL;

    commandEvent = CommandBuffer_CommandEvent_GetCollision(thisx, COMMANDEVENTTYPE_SPAWN, COMMANDEVENTTYPE_ADDCAT);
    if (!commandEvent) {
        commandEvent = CommandBuffer_CommandEvent_GetNext();
    }

    if (commandEvent) {
        commandEvent->type = COMMANDEVENTTYPE_SPAWNTRANSITION;
        commandEvent->params.actor = thisx;
        gCmdBuffer->eventCount++;
    }
}

#ifdef GAME_OOT
Actor* Actor_SpawnTransitionActorCave(ActorContext* actorCtx, GlobalContext* globalCtx, int16_t actorId, float posX, float posY, float posZ, int16_t rotX, int16_t rotY, int16_t rotZ, int16_t params) {
    Actor* actor = Actor_Spawn(actorCtx, globalCtx, actorId, posX, posY, posZ, rotX, rotY, rotZ, params);
    Actor_SpawnEvent(actor);
    return actor;
}
#elif defined GAME_MM
void Actor_SpawnTransitionActorCave(GlobalContext* globalCtx, ActorContext* actorCtx) {
    Actor* actor;
    TransitionActorEntry* transitionActorList = globalCtx->doorCtx.transitionActorList;
    s32 i;
    s16 numTransitionActors = globalCtx->doorCtx.numTransitionActors;

    for (i = 0; i < numTransitionActors; transitionActorList++, i++) {
        if (transitionActorList->id >= 0) {
            if ((transitionActorList->sides[0].room >= 0 &&
                 (globalCtx->roomCtx.curRoom.num == transitionActorList->sides[0].room ||
                  globalCtx->roomCtx.prevRoom.num == transitionActorList->sides[0].room)) ||
                (transitionActorList->sides[1].room >= 0 &&
                 (globalCtx->roomCtx.curRoom.num == transitionActorList->sides[1].room ||
                  globalCtx->roomCtx.prevRoom.num == transitionActorList->sides[1].room))) {
                s16 rotY = ((transitionActorList->rotY >> 7) & 0x1FF) * (0x10000 / 360.0f);

                actor = Actor_SpawnAsChildAndCutscene(actorCtx, globalCtx, transitionActorList->id & 0x1FFF,
                                                  transitionActorList->pos.x, transitionActorList->pos.y,
                                                  transitionActorList->pos.z, 0, rotY, 0,
                                                  (i << 0xA) + (transitionActorList->params & 0x3FF),
                                                  transitionActorList->rotY & 0x7F, 0x3FF, 0);
                if (actor != NULL) {
                    transitionActorList->id = -transitionActorList->id;
                    Actor_SpawnEvent(actor);
                }
                numTransitionActors = globalCtx->doorCtx.numTransitionActors;
            }
        }
    }
}
#endif

