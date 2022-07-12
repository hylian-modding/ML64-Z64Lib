 #include "Actor_InitCave.h"
 
 void Actor_InitCave(Actor* actor, GlobalContext* globalCtx) {
    register CommandEvent* commandEvent = CommandBuffer_CommandEvent_GetCollision(actor, COMMANDEVENTTYPE_INIT, COMMANDEVENTTYPE_INIT);

    if (commandEvent) {
        commandEvent->type = COMMANDEVENTTYPE_INIT;
        commandEvent->params.actor = actor;
    }
    else {
        commandEvent = CommandBuffer_CommandEvent_GetNext();

        if (commandEvent) {
            commandEvent->type = COMMANDEVENTTYPE_INIT;
            commandEvent->params.actor = actor;
            gCmdBuffer->eventCount++;
        }
    }

    Actor_Init(actor, globalCtx);

    return;
}