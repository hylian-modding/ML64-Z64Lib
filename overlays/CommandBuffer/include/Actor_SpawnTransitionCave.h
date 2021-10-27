#ifndef __ACTOR_SPAWN_TRANSITION_CAVE_H__
#define __ACTOR_SPAWN_TRANSITION_CAVE_H__

#include <libzelda64.h>
#include "Actor_CaveHelpers.h"

#ifdef GAME_OOT
Actor* Actor_SpawnTransitionActorCave(ActorContext* actorCtx, GlobalContext* globalCtx, int16_t actorId, float posX, float posY, float posZ, int16_t rotX, int16_t rotY, int16_t rotZ, int16_t params);
#elif defined GAME_MM
void Actor_SpawnTransitionActorsCave(GlobalContext* globalCtx, ActorContext* actorCtx);
#define Actor_SpawnTransitionActorCave Actor_SpawnTransitionActorsCave
#endif

#endif