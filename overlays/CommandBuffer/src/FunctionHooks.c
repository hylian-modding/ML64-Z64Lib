#include "FunctionHooks.h"
#include <libzelda64.h>

static void init(void* thisx, GlobalContext* globalCtx)
{
}

static void destroy(void* thisx, GlobalContext* globalCtx)
{
}

static void update(void* thisx, GlobalContext* globalCtx)
{
}

static void draw(void* thisx, GlobalContext* globalCtx)
{
}

#include "HaxEmbed.h"

ActorInit initVars = {
    .id = 5
    , .category = ACTORLIST_CATEGORY_NPC
    , .flags = (ACTORFLAG_NOP)
    , .objectId = 1
    , .instanceSize = sizeof(En_FunctionHooks)
    , .init = init
    , .destroy = destroy
    , .update = update
    , .draw = draw
};