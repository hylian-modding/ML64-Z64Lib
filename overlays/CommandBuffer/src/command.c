#include "command.h"

void CommandFunc_ActorSpawn(Command* thisx, CommandReturn* commandReturn, GlobalContext* globalCtx, ActorContext* actorCtx) {
    if (commandReturn) {
        commandReturn->type = thisx->type;
        commandReturn->uuid = thisx->uuid;
#ifdef GAME_MM
        if (thisx->params.actorSpawn.type == ACTORSPAWNTYPE_WITHPARENTANDCUTSCENE) {
            commandReturn->data.actorSpawn.actor = Actor_SpawnAsChildAndCutscene(actorCtx, globalCtx, thisx->params.actorSpawn.actorId, thisx->params.actorSpawn.pos.x, thisx->params.actorSpawn.pos.y, thisx->params.actorSpawn.pos.z, thisx->params.actorSpawn.rot.x, thisx->params.actorSpawn.rot.y, thisx->params.actorSpawn.rot.z, thisx->params.actorSpawn.params, thisx->params.actorSpawn.cutscene, thisx->params.actorSpawn.param_12, thisx->params.actorSpawn.address);
        }
        else
#endif
        if (thisx->params.actorSpawn.address) {
            Actor_SpawnWithAddress(globalCtx, thisx->params.actorSpawn.actorId, thisx->params.actorSpawn.params, &thisx->params.actorSpawn.pos, &thisx->params.actorSpawn.rot, thisx->params.actorSpawn.address);
            commandReturn->data.actorSpawn.actor = thisx->params.actorSpawn.address;
        }
        else {
            if (thisx->type == COMMANDTYPE_SPAWNNOEVENT) {
                commandReturn->data.actorSpawn.actor = Actor_SpawnNoEvent(actorCtx, globalCtx, thisx->params.actorSpawn.actorId, thisx->params.actorSpawn.pos.x, thisx->params.actorSpawn.pos.y, thisx->params.actorSpawn.pos.z, thisx->params.actorSpawn.rot.x, thisx->params.actorSpawn.rot.y, thisx->params.actorSpawn.rot.z, thisx->params.actorSpawn.params);
            }
            else {
                commandReturn->data.actorSpawn.actor = Actor_Spawn(actorCtx, globalCtx, thisx->params.actorSpawn.actorId, thisx->params.actorSpawn.pos.x, thisx->params.actorSpawn.pos.y, thisx->params.actorSpawn.pos.z, thisx->params.actorSpawn.rot.x, thisx->params.actorSpawn.rot.y, thisx->params.actorSpawn.rot.z, thisx->params.actorSpawn.params);
            }
        }
    }
}

void CommandFunc_ActorAddRemCat(Command* thisx, GlobalContext* globalCtx, ActorContext* actorCtx) {
    switch (thisx->params.actorCat.type) {
        case (ACTORADDREMCAT_REMOVE): {
            Actor_RemoveFromCategory(globalCtx, actorCtx, thisx->params.actorCat.address);
            break;
        }
        case (ACTORADDREMCAT_ADD): {
            Actor_AddToCategory(actorCtx, thisx->params.actorCat.address, thisx->params.actorCat.category);
            break;
        }
        default:
        case (ACTORADDREMCAT_DELETE): {
            Actor_Delete(actorCtx, thisx->params.actorCat.address, globalCtx);
            break;
        }
    }
}

void CommandFunc_OverlayRelocate(Command* thisx, GlobalContext* globalCtx, ActorContext* actorCtx) {
    Overlay_Relocate(thisx->params.relocate.allocatedVRamAddress, thisx->params.relocate.overlayInfo, thisx->params.relocate.vRamAddress);
}

// Thanks, Fig!
void CommandFunc_Warp(Command* thisx, GlobalContext* globalCtx, ActorContext* actorCtx) {
    register uint32_t vtemp;
#ifdef GAME_OOT
    gSaveContext.nextCutsceneIndex = thisx->params.warp.cutsceneIndex; // TODO: not sure if this is in mm?
#endif
    globalCtx->nextEntranceIndex = thisx->params.warp.entranceIndex;
    globalCtx->sceneLoadFlag = 0x14;

    if (thisx->params.warp.transition == -1) {
        vtemp = Rand_S16Offset(0, 5);
        if (vtemp == 0) {
            globalCtx->fadeTransition = 0;
        }
        else if (vtemp == 1) {
            globalCtx->fadeTransition = 1;
        }
        else if (vtemp == 2) {
            globalCtx->fadeTransition = 4;
        }
        else if (vtemp == 3) {
            globalCtx->fadeTransition = 5;
        }
        else if (vtemp == 4) {
            globalCtx->fadeTransition = 32;
        }
        else if (vtemp == 5) {
            globalCtx->fadeTransition = 44;
        }
        else {
            // Something wack happened?
            globalCtx->fadeTransition = 0;
        }
    }
    else {
        globalCtx->fadeTransition = thisx->params.warp.transition;
    }
    
    if (thisx->params.warp.age != -1) {
#ifdef GAME_OOT
        globalCtx->linkAgeOnLoad = thisx->params.warp.age;
#elif defined GAME_MM
        gSaveContext.playerForm = thisx->params.warp.age;
#endif
    }
}

void CommandFunc_MovePlayerToAddress(Command* thisx, CommandReturn* commandReturn, GlobalContext* globalCtx, ActorContext* actorCtx) {
    Player* player = ((Player*)globalCtx->actorCtx.actorLists[ACTORLIST_CATEGORY_PLAYER].head);
    
    if (commandReturn) {
        if (player != thisx->params.movePlayerToAddr.address) {
            // murk lonk
            player->actor.update = 0;
            player->actor.draw = 0;
            // murk novi
            player->naviActor->update = 0;
            player->naviActor->draw = 0;
            Actor_SpawnWithAddress(globalCtx, player->actor.id, player->actor.params, &thisx->params.actorSpawn.pos, &thisx->params.actorSpawn.rot, thisx->params.actorSpawn.address);
            Actor_RemoveFromCategory(globalCtx, actorCtx, player->naviActor);
            Actor_RemoveFromCategory(globalCtx, actorCtx, player);
            ZeldaArena_Free(player->naviActor);
            ZeldaArena_Free(player);
            player = thisx->params.movePlayerToAddr.address;
            commandReturn->type = thisx->type;
            commandReturn->uuid = thisx->uuid;
            commandReturn->data.actorSpawn.actor = player;
            globalCtx->mainCamera.player = player;
            globalCtx->mainCamera.target = player;
        }
    }
}

void CommandFunc_ArbitraryFunctionCall(Command* thisx, CommandReturn* commandReturn, GlobalContext* globalCtx, ActorContext* actorCtx) {
    if (commandReturn) {
        commandReturn->type = thisx->type;
        commandReturn->uuid = thisx->uuid;
        if (thisx->params.arbFn.argc == 0) {
            commandReturn->data.arbFn.value = thisx->params.arbFn.fn();
        }
        else if (thisx->params.arbFn.argc == 1) {
            commandReturn->data.arbFn.value = thisx->params.arbFn.fn(thisx->params.arbFn.args[0]);
        }
        else if (thisx->params.arbFn.argc == 2) {
            commandReturn->data.arbFn.value = thisx->params.arbFn.fn(thisx->params.arbFn.args[0], thisx->params.arbFn.args[1]);
        }
        else if (thisx->params.arbFn.argc == 3) {
            commandReturn->data.arbFn.value = thisx->params.arbFn.fn(thisx->params.arbFn.args[0], thisx->params.arbFn.args[1], thisx->params.arbFn.args[2]);
        }
        else if (thisx->params.arbFn.argc == 4) {
            commandReturn->data.arbFn.value = thisx->params.arbFn.fn(thisx->params.arbFn.args[0], thisx->params.arbFn.args[1], thisx->params.arbFn.args[2], thisx->params.arbFn.args[3]);
        }
        else if (thisx->params.arbFn.argc == 5) {
            commandReturn->data.arbFn.value = thisx->params.arbFn.fn(thisx->params.arbFn.args[0], thisx->params.arbFn.args[1], thisx->params.arbFn.args[2], thisx->params.arbFn.args[3], thisx->params.arbFn.args[4]);
        }
        else if (thisx->params.arbFn.argc == 6) {
            commandReturn->data.arbFn.value = thisx->params.arbFn.fn(thisx->params.arbFn.args[0], thisx->params.arbFn.args[1], thisx->params.arbFn.args[2], thisx->params.arbFn.args[3], thisx->params.arbFn.args[4], thisx->params.arbFn.args[5]);
        }
        else if (thisx->params.arbFn.argc == 7) {
            commandReturn->data.arbFn.value = thisx->params.arbFn.fn(thisx->params.arbFn.args[0], thisx->params.arbFn.args[1], thisx->params.arbFn.args[2], thisx->params.arbFn.args[3], thisx->params.arbFn.args[4], thisx->params.arbFn.args[5], thisx->params.arbFn.args[6]);
        }
        else if (thisx->params.arbFn.argc == 8) {
            commandReturn->data.arbFn.value = thisx->params.arbFn.fn(thisx->params.arbFn.args[0], thisx->params.arbFn.args[1], thisx->params.arbFn.args[2], thisx->params.arbFn.args[3], thisx->params.arbFn.args[4], thisx->params.arbFn.args[5], thisx->params.arbFn.args[6], thisx->params.arbFn.args[7]);
        }
    }
}

void CommandFunc_MallocFree(Command* thisx, CommandReturn* commandReturn, GlobalContext* globalCtx, ActorContext* actorCtx) {
    if (commandReturn) {
        if (thisx->params.mallocFree.malloc) {
            commandReturn->type = thisx->type;
            commandReturn->uuid = thisx->uuid;
            if (thisx->params.mallocFree.malloc == 2) {
                commandReturn->data.mallocFree.result = ZeldaArena_MallocR(thisx->params.mallocFree.data);
            }
            else {
                commandReturn->data.mallocFree.result = ZeldaArena_Malloc(thisx->params.mallocFree.data);
            }
        }
        else {
            ZeldaArena_Free(thisx->params.mallocFree.data);
        }
    }
}

void CommandFunc_ObjectLoad(Command* thisx, CommandReturn* commandReturn, GlobalContext* globalCtx, ActorContext* actorCtx) {
    if (commandReturn) {
        commandReturn->type = thisx->type;
        commandReturn->uuid = thisx->uuid;
        commandReturn->data.objLoad.index = Object_Spawn(&globalCtx->objectCtx, thisx->params.objLoad.objectId);
    }
}
