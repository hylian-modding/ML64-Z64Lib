#ifndef __ACTOR_SPAWN_ENTRY_H__
#define __ACTOR_SPAWN_ENTRY_H__

#include <libzelda64.h>
#include "FunctionInject.h"
#include "commandevent.h"
#include "Actor_CaveHelpers.h"

struct Actor* Actor_SpawnEntryCave(struct ActorContext* actorCtx, struct ActorEntry* actorEntry, struct GlobalContext* globalCtx);

#endif /* __ACTOR_SPAWN_ENTRY_H__ */
