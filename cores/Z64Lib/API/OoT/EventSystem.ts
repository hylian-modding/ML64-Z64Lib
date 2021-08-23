import { IActorManager } from "@Z64Lib/API/Common/Z64API";
import { ActorCategory, IActor, Z64 } from "@Z64Lib/API/imports";
import { ActorBase, CommandBuffer_CommandEventType, COMMAND_EVENT_OFFSET, COMMAND_EVENT_SIZEOF } from "@Z64Lib/src/importsOOT";
import { bus } from "modloader64_api/EventHandler";
import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";

export class EventSystem implements IActorManager {

    ModLoader: IModLoaderAPI;
    cmd_pointer: number;
    actors: Map<ActorCategory, IActor[]> = new Map();
    allActors: Map<number, IActor> = new Map();
    objects: Map<number, number> = new Map();

    constructor(ModLoader: IModLoaderAPI, cmd_pointer: number) {
        this.ModLoader = ModLoader;
        this.cmd_pointer = cmd_pointer;
        for (let i = 0; i < 12; i++) {
            this.actors.set(i, []);
        }
    }

    createIActorFromPointer(pointer: number): IActor {
        return new ActorBase(this.ModLoader.emulator, pointer);
    }

    getActors(category: ActorCategory): IActor[] {
        return this.actors.get(category)!;
    }

    onTick() {
        //console.log(this.ModLoader.emulator.rdramRead32(0x806C0000).toString(16));
        let count = this.ModLoader.emulator.rdramRead16(this.cmd_pointer + 0x2);
        if (count === 0) return;
        for (let i = 0; i < count; i++) {
            let offset = this.cmd_pointer + COMMAND_EVENT_OFFSET + (i * COMMAND_EVENT_SIZEOF);
            let event = this.ModLoader.emulator.rdramReadBuffer(offset, COMMAND_EVENT_SIZEOF);
            let id = event.readUInt32BE(0);
            switch (id) {
                case CommandBuffer_CommandEventType.NONE:
                    break;
                case CommandBuffer_CommandEventType.ERROR_FILLED:
                    break;
                case CommandBuffer_CommandEventType.INIT: {
                    let actorPointer = event.readUInt32BE(0x4);
                    let actor = this.createIActorFromPointer(actorPointer);
                    console.log("Actor was init: " + JSON.stringify(actor));
                    break;
                }
                case CommandBuffer_CommandEventType.SPAWN:
                case CommandBuffer_CommandEventType.SPAWNENTRY:
                case CommandBuffer_CommandEventType.SPAWNTRANSITION: {
                    let actorPointer = event.readUInt32BE(0x4);
                    let actor = this.createIActorFromPointer(actorPointer);
                    this.actors.get(actor.actorType)!.push(actor);
                    this.allActors.set(actorPointer, actor);
                    bus.emit(Z64.OotEvents.ON_ACTOR_SPAWN, actor);
                    break;
                }
                case CommandBuffer_CommandEventType.DESTROY: {
                    let actorPointer = event.readUInt32BE(0x4);
                    this.actors.forEach((actors: IActor[]) => {
                        for (let i = 0; i < actors.length; i++) {
                            if (actors[i].pointer === actorPointer) {
                                bus.emit(Z64.OotEvents.ON_ACTOR_DESPAWN, actors[i]);
                                break;
                            }
                        }
                    });
                    this.allActors.delete(actorPointer);
                    break;
                }
                case CommandBuffer_CommandEventType.UPDATE: {
                    let actorPointer = event.readUInt32BE(0x4);
                    let actor = this.actors.get(actorPointer)!;
                    bus.emit(Z64.OotEvents.ON_ACTOR_UPDATE, actor);
                    break;
                }
                case CommandBuffer_CommandEventType.OBJECTSPAWN: {
                    break;
                }
            }
            this.ModLoader.utils.clearBuffer(event);
            this.ModLoader.emulator.rdramWriteBuffer(offset, event);
        }
        this.ModLoader.emulator.rdramWrite16(this.cmd_pointer + 0x2, 0);
    }

}