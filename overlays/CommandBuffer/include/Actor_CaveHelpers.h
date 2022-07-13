#ifndef ACTOR_HOOKHELPERS_H
#define ACTOR_HOOKHELPERS_H

#include <libzelda64.h>
#include "commandbuffer.h"

#define AM_FIELD_SIZE 0x27A0

extern CommandEvent* CommandBuffer_CommandEvent_GetNext(void);
extern CommandEvent* CommandBuffer_CommandEvent_GetCollision(struct Actor* actor, uint32_t minType, uint32_t maxType);

#endif

