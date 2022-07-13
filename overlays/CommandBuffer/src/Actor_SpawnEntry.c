#include "Actor_SpawnEntry.h"
#include <libzelda64.h>

Actor* Actor_SpawnEntryCave(ActorContext* actorCtx, ActorEntry* actorEntry, GlobalContext* globalCtx) {
    register CommandEvent* commandEvent = 0;
    Actor* actor = Actor_SpawnEntry(actorCtx, actorEntry, globalCtx);

    commandEvent = CommandBuffer_CommandEvent_GetCollision(actor, COMMANDEVENTTYPE_SPAWN, COMMANDEVENTTYPE_SPAWNTRANSITION);
    if (commandEvent) {
        commandEvent->type = COMMANDEVENTTYPE_SPAWNENTRY;
        commandEvent->params.actor = actor;
    }
    else {
        commandEvent = CommandBuffer_CommandEvent_GetNext();

        if (commandEvent) {
            commandEvent->type = COMMANDEVENTTYPE_SPAWNENTRY;
            commandEvent->params.actor = actor;
            gCmdBuffer->eventCount++;
        }
    }

    return actor;
}
