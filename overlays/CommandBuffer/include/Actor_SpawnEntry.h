#ifndef __ACTOR_SPAWN_ENTRY_H__
#define __ACTOR_SPAWN_ENTRY_H__

#include <libzelda64.h>
#include "FunctionInject.h"
#include "commandevent.h"
#include "Actor_CaveHelpers.h"

extern Actor* Actor_SpawnEntryCave(ActorContext* actorCtx, ActorEntry* actorEntry, GlobalContext* globalCtx);

#endif /* __ACTOR_SPAWN_ENTRY_H__ */
