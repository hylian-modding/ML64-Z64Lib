#include "ActorDestroy.h"

static void Actor_DestroyEvent(Actor* thisx) {
    register CommandEvent* commandEvent;
    
    commandEvent = CommandBuffer_CommandEvent_GetCollision(thisx, COMMANDEVENTTYPE_DESTROY, COMMANDEVENTTYPE_DESTROY);

    if (!commandEvent) {
        commandEvent = CommandBuffer_CommandEvent_GetNext();
    }

    if (commandEvent) {
        commandEvent->type = COMMANDEVENTTYPE_DESTROY;
        commandEvent->params.actor = thisx;
        gCmdBuffer->eventCount++;
    }
}

#ifdef GAME_OOT
void Actor_DestroyCave(Actor* actor, GlobalContext* globalCtx) {
    Actor_DestroyEvent(actor);
    actor->destroy(actor, globalCtx);

    return;
}
#elif defined GAME_MM
void Actor_DestroyCave(Actor* actor, GlobalContext* globalCtx) {
    Actor_DestroyEvent(actor);
    actor->destroy(actor, globalCtx);

    return;
}

#endif

