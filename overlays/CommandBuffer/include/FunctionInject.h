#ifndef __HAX_INJECT_H__
#define __HAX_INJECT_H__

#include <libzelda64.h>

typedef struct{
    /* 0x00 */ uint32_t Actor_Spawn;
    /* 0x04 */ uint32_t Actor_Destroy;
    /* 0x08 */ uint32_t Actor_SpawnEntry;
    /* 0x0C */ uint32_t Actor_Init;
    /* 0x10 */ uint32_t Actor_Update;
    /* 0x14 */ uint32_t Actor_SpawnTransition;
    /* 0x18 */ uint32_t Actor_SpawnAsChildAndCutscene;
    /* 0x1C */ uint32_t Object_Spawn;
    /* 0x20 */ uint32_t Actor_SpawnWithAddress;
    /* 0x24 */ uint32_t Actor_AddToCategory;
    /* 0x28 */ uint32_t Actor_RemoveFromCategory;
} En_FunctionHooks; /* sizeof = 0x2C */

extern En_FunctionHooks* haxPointer;

#endif /* __HAX_INJECT_H__ */