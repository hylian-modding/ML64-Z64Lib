#ifndef __ACTOR_SPAWN_WITH_PARENT_AND_CUTSCENE_H__
#define __ACTOR_SPAWN_WITH_PARENT_AND_CUTSCENE_H__

#include <libzelda64.h>
#include "Actor_CaveHelpers.h"

// This function is unique to mm
Actor* Actor_SpawnWithParentAndCutsceneCave(ActorContext* actorCtx, GlobalContext* globalCtx, int16_t index, float x, float y, float z, int16_t rotX, int16_t rotY, int16_t rotZ, int32_t params, uint32_t cutscene, int32_t param_12, Actor* parent);

#endif /* __ACTOR_SPAWN_WITH_PARENT_AND_CUTSCENE_H__ */