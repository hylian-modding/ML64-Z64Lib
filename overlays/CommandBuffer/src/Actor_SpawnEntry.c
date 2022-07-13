#include "Actor_SpawnEntry.h"
#include <libzelda64.h>

static void Actor_SpawnEvent(Actor* thisx) {
    register CommandEvent* commandEvent = NULL;

    commandEvent = CommandBuffer_CommandEvent_GetCollision(thisx, COMMANDEVENTTYPE_SPAWN, COMMANDEVENTTYPE_ADDCAT);
    if (!commandEvent) {
        commandEvent = CommandBuffer_CommandEvent_GetNext();
    }

    if (commandEvent) {
        commandEvent->type = COMMANDEVENTTYPE_SPAWNENTRY;
        commandEvent->params.actor = thisx;
        gCmdBuffer->eventCount++;
    }
}

#ifdef GAME_OOT
Actor* Actor_SpawnEntryCave(ActorContext* actorCtx, ActorEntry* actorEntry, GlobalContext* globalCtx) {
    Actor* actor = Actor_SpawnEntry(actorCtx, actorEntry, globalCtx);

    if (actor != NULL) {
        Actor_SpawnEvent(actor);
    }

    return actor;
}
#elif defined GAME_MM
Actor* Actor_SpawnEntryCave(ActorContext* actorCtx, ActorEntry* actorEntry, GlobalContext* globalCtx) {
    Actor* actor;
    s16 rotX = (actorEntry->rot.x >> 7) & 0x1FF;
    s16 rotY = (actorEntry->rot.y >> 7) & 0x1FF;
    s16 rotZ = (actorEntry->rot.z >> 7) & 0x1FF;

    if (!(actorEntry->id & 0x8000)) {
        rotY *= 0x10000 / 360.0f;
    } else if (rotY > 180) {
        rotY -= 360;
    }

    if (!(actorEntry->id & 0x4000)) {
        rotX *= 0x10000 / 360.0f;
    } else if (rotX > 180) {
        rotX -= 360;
    }

    if (!(actorEntry->id & 0x2000)) {
        rotZ *= 0x10000 / 360.0f;
    } else if (rotZ > 180) {
        rotZ -= 360;
    }

    actor = Actor_SpawnAsChildAndCutscene(actorCtx, globalCtx, actorEntry->id & 0x1FFF, actorEntry->pos.x, actorEntry->pos.y,
                                         actorEntry->pos.z, rotX, rotY, rotZ, actorEntry->params & 0xFFFF,
                                         actorEntry->rot.y & 0x7F,
                                         ((actorEntry->rot.x & 7) << 7) | (actorEntry->rot.z & 0x7F), NULL);

    if (actor != NULL) {
        Actor_SpawnEvent(actor);
    }

    return actor;
}
#endif

