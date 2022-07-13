#include "Actor_CategoryCave.h"

static void Actor_CategoryEvent(Actor* thisx, uint32_t type, uint8_t cat) {
    register CommandEvent* commandEvent = NULL;

    commandEvent = CommandBuffer_CommandEvent_GetCollision(thisx, COMMANDEVENTTYPE_ADDCAT, COMMANDEVENTTYPE_REMCAT);
    if (!commandEvent) {
        commandEvent = CommandBuffer_CommandEvent_GetNext();
    }

    if (commandEvent) {
        commandEvent->type = type;
        commandEvent->params.actor = thisx;
        commandEvent->params.category.category = cat;
        gCmdBuffer->eventCount++;
    }
}

#ifdef GAME_OOT
void Actor_AddToCategoryCave(ActorContext* actorCtx, Actor* actorToAdd, u8 actorCategory) {
    Actor* prevHead;

    actorToAdd->category = actorCategory;

    actorCtx->total++;
    actorCtx->actorLists[actorCategory].length++;
    prevHead = actorCtx->actorLists[actorCategory].head;

    if (prevHead != NULL) {
        prevHead->prev = actorToAdd;
    }

    actorCtx->actorLists[actorCategory].head = actorToAdd;
    actorToAdd->next = prevHead;

    Actor_CategoryEvent(actorToAdd, COMMANDEVENTTYPE_ADDCAT, actorCategory);
}

Actor* Actor_RemoveFromCategoryCave(GlobalContext* play, ActorContext* actorCtx, Actor* actorToRemove) {
    Actor* newHead;

    actorCtx->total--;
    actorCtx->actorLists[actorToRemove->category].length--;

    if (actorToRemove->prev != NULL) {
        actorToRemove->prev->next = actorToRemove->next;
    }
    else {
        actorCtx->actorLists[actorToRemove->category].head = actorToRemove->next;
    }

    newHead = actorToRemove->next;

    if (newHead != NULL) {
        newHead->prev = actorToRemove->prev;
    }

    actorToRemove->next = NULL;
    actorToRemove->prev = NULL;

    if ((actorToRemove->room == play->roomCtx.curRoom.num) && (actorToRemove->category == ACTORCAT_ENEMY) &&
        (actorCtx->actorLists[ACTORCAT_ENEMY].length == 0)) {
        Flags_SetTempClear(play, play->roomCtx.curRoom.num);
    }

    Actor_CategoryEvent(actorToRemove, COMMANDEVENTTYPE_REMCAT, actorToRemove->category);

    return newHead;
}
#elif defined GAME_MM
void Actor_AddToCategoryCave(ActorContext* actorCtx, Actor* actor, u8 actorCategory) {
    Actor* actorAux;
    Actor* lastActor;

    actor->category = actorCategory;

    actorCtx->total++;
    actorCtx->actorLists[actorCategory].length++;
    lastActor = actorCtx->actorLists[actorCategory].head;

    if (lastActor == NULL) {
        actorCtx->actorLists[actorCategory].head = actor;
        return;
    }

    actorAux = lastActor->next;
    while (actorAux != NULL) {
        lastActor = actorAux;
        actorAux = actorAux->next;
    }

    lastActor->next = actor;
    actor->prev = lastActor;

    Actor_CategoryEvent(actor, COMMANDEVENTTYPE_ADDCAT, actorCategory);
}

Actor* Actor_RemoveFromCategoryCave(GlobalContext* play, ActorContext* actorCtx, Actor* actorToRemove) {
    Actor* newHead;

    actorCtx->total--;
    actorCtx->actorLists[actorToRemove->category].length--;

    if (actorToRemove->prev != NULL) {
        actorToRemove->prev->next = actorToRemove->next;
    }
    else {
        actorCtx->actorLists[actorToRemove->category].head = actorToRemove->next;
    }

    newHead = actorToRemove->next;

    if (newHead != NULL) {
        newHead->prev = actorToRemove->prev;
    }

    actorToRemove->next = NULL;
    actorToRemove->prev = NULL;

    if ((actorToRemove->room == play->roomCtx.curRoom.num) && (actorToRemove->category == ACTORCAT_ENEMY) &&
        (actorCtx->actorLists[ACTORCAT_ENEMY].length == 0)) {
        Flags_SetTempClear(play, play->roomCtx.curRoom.num);
    }

    Actor_CategoryEvent(actorToRemove, COMMANDEVENTTYPE_REMCAT, actorToRemove->category);

    return newHead;
}
#endif

