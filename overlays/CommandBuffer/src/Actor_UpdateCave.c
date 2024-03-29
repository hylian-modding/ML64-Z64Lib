#include "Actor_UpdateCave.h"

void Actor_UpdateCave(Actor* actor, GlobalContext* globalCtx) {
    register CommandEvent* commandEvent = CommandBuffer_CommandEvent_GetCollision(actor, COMMANDEVENTTYPE_UPDATE, COMMANDEVENTTYPE_UPDATE);

    if (commandEvent) {
        commandEvent->type = COMMANDEVENTTYPE_UPDATE;
        commandEvent->params.actor = actor;
    }
    else {
        commandEvent = CommandBuffer_CommandEvent_GetNext();

        if (commandEvent) {
            commandEvent->type = COMMANDEVENTTYPE_UPDATE;
            commandEvent->params.actor = actor;
            gCmdBuffer->eventCount++;
        }
    }

    actor->update(actor, globalCtx);

    return;
}

