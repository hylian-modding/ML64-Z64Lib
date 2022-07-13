#ifndef ACTOR_CATEGORYCAVE_H
#define ACTOR_CATEGORYCAVE_H

#include <libzelda64.h>
#include "commandbuffer.h"

extern void Actor_AddToCategoryCave(ActorContext* actorCtx, Actor* actor, u8 actorCategory);
extern Actor* Actor_RemoveFromCategoryCave(GlobalContext* play, ActorContext* actorCtx, Actor* actorToRemove);

#endif

