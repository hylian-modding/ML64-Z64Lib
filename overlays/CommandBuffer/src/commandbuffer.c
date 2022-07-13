#include <libzelda64.h>
#include "commandbuffer.h"
#include "command.h"
#include "commandreturn.h"
#include "Actor_SpawnWithAddress.h"
#include "Actor_SpawnNoEvent.h"

extern void memset_fast_32(u32* dest, u32 value, u32 length);

volatile CommandBuffer* gCmdBuffer = 0xBADF00D;
const uint32_t cbSize = sizeof(CommandBuffer);

#ifdef GAMESTATE_CAVE
void CommandBuffer_Update(GameState* gameState)
#else
void CommandBuffer_Update(GlobalContext* globalCtx, struct ActorContext* actorCtx)
#endif
{
    uint32_t index;
    uint32_t qndex;
    CommandBuffer* cmdBuffer = gCmdBuffer; // help gcc not write bogus behavior. wtf
    Command* command;
    CommandReturn* commandReturn;
    CommandEvent* commandEvent;
#ifdef GAMESTATE_CAVE
    GlobalContext* globalCtx = &gGlobalCtx;
    ActorContext* actorCtx = &globalCtx->actorCtx;

    gameState->main(gameState);
    if (cmdBuffer == NULL || cmdBuffer == 0xBADF00D) return;
#else
    if (cmdBuffer == NULL || cmdBuffer == 0xBADF00D) goto LActor_UpdateAll;
#endif

    for (index = 0; index < cmdBuffer->commandCount; index++) {
        command = &cmdBuffer->commands[index];
        commandReturn = NULL;

        // get next command return, if a slot is available
        for (qndex = 0; qndex < COMMAND_MAX; qndex++) {
            if (cmdBuffer->commandReturns[qndex].type == COMMANDTYPE_NONE) {
                commandReturn = &cmdBuffer->commandReturns[qndex];
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
            default: {
                // report bogus command
                commandEvent = CommandBuffer_CommandEvent_GetNext();
                commandEvent->type = COMMANDEVENTTYPE_ERROR_FILLED;
                commandEvent->params.unknown.uuid = command->uuid;
                commandEvent->params.unknown.type = command->type;
                break;
            }
            case (COMMANDTYPE_NONE): {
                break;
            }
        }

        command->type = COMMANDTYPE_NONE;
    }

    cmdBuffer->commandCount = 0;

    // handle death by nuking ourselves like a star, and rising from the ashes like a phoenix
    // causes loss of event data, might want to have a timeout in Z64O
    if (cmdBuffer->eventCount >= COMMANDEVENT_MAX) {
        cmdBuffer->eventCount = 0;
        memset_fast_32(cmdBuffer->commandEvents, 0, sizeof(cmdBuffer->commandEvents));

        commandEvent = &cmdBuffer->commandEvents[0];
        commandEvent->type = COMMANDEVENTTYPE_ERROR_FILLED; // notify Z64O that we died
        commandEvent->params.unknown.uuid = -1;
        commandEvent->params.unknown.type = -1;
    }

#ifndef GAMESTATE_CAVE
LActor_UpdateAll:;
    Actor_UpdateAll(globalCtx, actorCtx);
#endif
}

