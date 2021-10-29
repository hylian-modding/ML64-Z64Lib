#ifndef __HAX_EMBED_H__
#define __HAX_EMBED_H__

#include <libzelda64.h>
#include "FunctionInject.h"
#include "commandbuffer.h"
#include "FunctionHooks.h"

typedef struct{
    uint32_t start;
    uint32_t entryPoint;
    En_FunctionHooks funcs;
    uint32_t end;
} HaxEmbed_t;

#endif /* __HAX_EMBED_H__ */