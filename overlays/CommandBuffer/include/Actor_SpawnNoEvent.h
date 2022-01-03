#ifndef __ACTOR_SNE_H__
#define __ACTOR_SNE_H__

#include <libzelda64.h>
#include "FunctionInject.h"
#include "commandevent.h"
#include "Actor_CaveHelpers.h"

#define AM_FIELD_SIZE 0x27A0
#define ACTOR_NUMBER_MAX 200

#ifdef GAME_OOT
Actor* Actor_SpawnNoEvent(ActorContext* actorCtx, GlobalContext* globalCtx, s16 actorId, f32 posX, f32 posY, f32 posZ,
                   s16 rotX, s16 rotY, s16 rotZ, s16 params);
#elif defined GAME_MM
Actor* Actor_SpawnNoEvent(ActorContext* actorCtx, GlobalContext* globalCtx, int16_t index, float x, float y, float z, int16_t rotX, int16_t rotY, int16_t rotZ, int32_t params);
#endif

#endif /* __ACTOR_SNE_H__ */