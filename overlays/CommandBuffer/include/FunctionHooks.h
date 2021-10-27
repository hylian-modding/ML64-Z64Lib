#ifndef __OVL_EN_HAXBASE__
#define __OVL_EN_HAXBASE__

#include <libzelda64.h>
#include "FunctionInject.h"
#include "ActorSpawn.h"
#include "ActorDestroy.h"
#include "Actor_SpawnEntry.h"
#include "Actor_InitCave.h"
#include "Actor_UpdateCave.h"
#include "Actor_SpawnTransitionCave.h"
#include "Actor_SpawnWithParentAndCutsceneCave.h"
#ifdef EXPLODY_BULLSHIT
#include "Object_SpawnCave.h"
#endif
#include "Actor_SpawnWithAddress.h"

static void init(void* thisx, GlobalContext* globalCtx);
static void destroy(void* thisx, GlobalContext* globalCtx);
static void update(void* thisx, GlobalContext* globalCtx);
static void draw(void* thisx, GlobalContext* globalCtx);

#endif /* __OVL_EN_HAXBASE__ */