
#include "Actor_CaveHelpers.h"

CommandEvent* CommandBuffer_CommandEvent_GetNext(void) {
    register CommandEvent* commandEvent = 0;
    register CommandBuffer* cmdBuffer = gCmdBuffer;

    if (cmdBuffer->eventCount < COMMANDEVENT_MAX) commandEvent = &cmdBuffer->commandEvents[cmdBuffer->eventCount];

    return commandEvent;
}

CommandEvent* CommandBuffer_CommandEvent_GetCollision(struct Actor* actor, uint32_t minType, uint32_t maxType) {
    uint32_t index;
    register CommandEvent* commandEvent = 0;
    register CommandBuffer* cmdBuffer = gCmdBuffer;

    // old method, slow, causes lag
#ifdef OLD_CE_GETNEXTCOLLISION
    for (index = 0; index < cmdBuffer->eventCount; index++) {
        if (cmdBuffer->commandEvents[index].type >= minType && cmdBuffer->commandEvents[index].type <= maxType) {
            if (cmdBuffer->commandEvents[index].params.actor == actor) {
                commandEvent = &cmdBuffer->commandEvents[index];
                break;
            }
        }
    }
#endif

    // new method, faster, assumes prior command would have been the command we are hijacking
    if (cmdBuffer->commandEvents[cmdBuffer->eventCount - 1].type >= minType && cmdBuffer->commandEvents[cmdBuffer->eventCount - 1].type <= maxType) {
        if (cmdBuffer->commandEvents[index].params.actor == actor) {
            commandEvent = &cmdBuffer->commandEvents[index];
        }
    }

    return commandEvent;
}

