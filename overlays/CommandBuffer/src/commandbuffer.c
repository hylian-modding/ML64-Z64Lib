#include <libzelda64.h>
#include "commandbuffer.h"
#include "command.h"
#include "commandreturn.h"
#include "Actor_SpawnWithAddress.h"
#include "Actor_SpawnNoEvent.h"

CommandBuffer* gCmdBuffer = 0xBADF00D;
const uint32_t cbSize = sizeof(CommandBuffer);

#ifdef GAMESTATE_CAVE
void CommandBuffer_Update(GameState* gameState)
#else
void CommandBuffer_Update(GlobalContext* globalCtx, struct ActorContext* actorCtx)
#endif
{
    uint32_t index;
    uint32_t qndex;
    Command* command;
    CommandReturn* commandReturn;
#ifdef GAMESTATE_CAVE
    GlobalContext* globalCtx = &gGlobalCtx;
    ActorContext* actorCtx = &globalCtx->actorCtx;
    
    gameState->main(gameState);
    if (gCmdBuffer == NULL || gCmdBuffer == 0xBADF00D) return;
#else
    if (gCmdBuffer == NULL || gCmdBuffer == 0xBADF00D) goto LActor_UpdateAll;
#endif

    for (index = 0; index < gCmdBuffer->commandCount; index++) {
        command = &gCmdBuffer->commands[index];
        commandReturn = NULL;

        // get next command return, if a slot is available
        for (qndex = 0; qndex < COMMAND_MAX; qndex++) {
            if (gCmdBuffer->commandReturns[qndex].type == COMMANDTYPE_NONE) {
                commandReturn = &gCmdBuffer->commandReturns[qndex];
                break;
            }
        }

        switch (command->type) {
            case (COMMANDTYPE_ACTORADDREMCAT): {
                CommandFunc_ActorAddRemCat(command, globalCtx, actorCtx);
                break;
            }
            case (COMMANDTYPE_RELOCATE): {
                CommandFunc_OverlayRelocate(command, globalCtx, actorCtx);
                break;
            }
            case (COMMANDTYPE_UPDATEBUTTON): {
                Interface_LoadItemIcon1(globalCtx, command->params.updateButton.button);
                break;
            }
            case (COMMANDTYPE_PLAYSOUND): {
                Audio_PlaySoundGeneral(
                    command->params.playSound.sfxId, &command->params.playSound.a1,
                    command->params.playSound.a2, &command->params.playSound.a3,
                    &command->params.playSound.a4, &command->params.playSound.a5
                );
                break;
            }
            case (COMMANDTYPE_WARP): {
                CommandFunc_Warp(command, globalCtx, actorCtx);
                break;
            }
            case (COMMANDTYPE_PVPDAMAGE): {
                // TODO: re-re-re-re-re implement
                break;
            }
            case (COMMANDTYPE_ACTORSPAWN):
            case (COMMANDTYPE_SPAWNNOEVENT): {
                CommandFunc_ActorSpawn(command, commandReturn, globalCtx, actorCtx);
                break;
            }
            case (COMMANDTYPE_MOVEPLAYERTOADDRESS): {
                CommandFunc_MovePlayerToAddress(command, commandReturn, globalCtx, actorCtx);
                break;
            }
            case (COMMANDTYPE_ARBITRARYFUNCTIONCALL): {
                CommandFunc_ArbitraryFunctionCall(command, commandReturn, globalCtx, actorCtx);
                break;
            }
            case (COMMANDTYPE_MALLOCFREE): {
                CommandFunc_MallocFree(command, commandReturn, globalCtx, actorCtx);
                break;
            } 
            case (COMMANDTYPE_OBJECTLOAD): {
                CommandFunc_ObjectLoad(command, commandReturn, globalCtx, actorCtx);
                break;
            }
            default:
            case (COMMANDTYPE_NONE): {
                break;
            }
        }

        command->type = COMMANDTYPE_NONE;
    }

    gCmdBuffer->commandCount = 0;

    // handle death by nuking ourselves like a star, and rising from the ashes like a phoenix
    if (gCmdBuffer->eventCount >= COMMANDEVENT_MAX) {
        gCmdBuffer->eventCount = 0;
        Lib_MemSet(gCmdBuffer->commandEvents, sizeof(gCmdBuffer->commandEvents), 0);

        gCmdBuffer->commandEvents[0].type = COMMANDEVENTTYPE_ERROR_FILLED; // notify ML64 that we died
    }

#ifndef GAMESTATE_CAVE
LActor_UpdateAll:;
    Actor_UpdateAll(globalCtx, actorCtx);
#endif
}

