#ifndef MODFUNCS_H
#define MODFUNCS_H

#include <libzelda64.h>

#define MAX_MOD_HOOKS 0x10

typedef void(*ModHookFunc)(GlobalContext* globalCtx);

extern const ModHookFunc modHooks[MAX_MOD_HOOKS];

#endif