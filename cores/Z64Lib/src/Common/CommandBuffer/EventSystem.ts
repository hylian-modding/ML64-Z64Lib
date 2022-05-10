import { IActorManager, IZ64Core } from "@Z64Lib/API/Common/Z64API";
import { ActorCategory, IActor, Z64 } from "@Z64Lib/API/imports";
import * as Z64CORE from "@Z64Lib/src/importsZ64";
import { bus } from "modloader64_api/EventHandler";
import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";

export class EventSystem implements IActorManager {

    ModLoader: IModLoaderAPI;
    core: IZ64Core;
    cmd_pointer: number;
    actors: Map<ActorCategory, IActor[]> = new Map();
    allActors: Map<number, IActor> = new Map();
    objects: Map<number, number> = new Map();

    constructor(ModLoader: IModLoaderAPI, core: IZ64Core, cmd_pointer: number) {
        this.ModLoader = ModLoader;
        this.cmd_pointer = cmd_pointer;
        for (let i = 0; i < 16; i++) {
            this.actors.set(i, []);
        }
        this.core = core;
    }

    createIActorFromPointer(pointer: number): IActor {
        return new Z64CORE.Z64.ActorBase(this.ModLoader, this.core.global.scene, pointer);
    }

    getActors(category: ActorCategory): IActor[] {
        return this.actors.get(category)!;
    }

    private processEvent(id: number, event: Buffer) {
        switch (id) {
            case Z64CORE.Z64.CommandBuffer_CommandEventType.NONE:
                break;
            case Z64CORE.Z64.CommandBuffer_CommandEventType.ERROR_FILLED:
                break;
            case Z64CORE.Z64.CommandBuffer_CommandEventType.INIT: {
                let actorPointer = event.readUInt32BE(0x4);
                let actor = this.createIActorFromPointer(actorPointer);
                break;
            }
            case Z64CORE.Z64.CommandBuffer_CommandEventType.SPAWNENTRY:
                break;
            case Z64CORE.Z64.CommandBuffer_CommandEventType.SPAWN:
            case Z64CORE.Z64.CommandBuffer_CommandEventType.SPAWNTRANSITION: {
                try {
                    let actorPointer = event.readUInt32BE(0x4);
                    let actor = this.createIActorFromPointer(actorPointer);
                    this.actors.get(actor.actorType)!.push(actor);
                    this.allActors.set(actorPointer, actor);
                    bus.emit(Z64.OotEvents.ON_ACTOR_SPAWN, actor);
                } catch (err: any) {
                    console.log(err);
                }
                break;
            }
            case Z64CORE.Z64.CommandBuffer_CommandEventType.DESTROY: {
                let actorPointer = event.readUInt32BE(0x4);
                this.actors.forEach((actors: IActor[], key: ActorCategory) => {
                    for (let i = 0; i < actors.length; i++) {
                        if (actors[i].pointer === actorPointer) {
                            actors[i].exists = false;
                            bus.emit(Z64.OotEvents.ON_ACTOR_DESPAWN, actors[i]);
                            actors.splice(i, 1);
                            break;
                        }
                    }
                });
                this.allActors.delete(actorPointer);
                break;
            }
            case Z64CORE.Z64.CommandBuffer_CommandEventType.UPDATE: {
                let actorPointer = event.readUInt32BE(0x4);
                let actor = this.actors.get(actorPointer)!;
                bus.emit(Z64.OotEvents.ON_ACTOR_UPDATE, actor);
                break;
            }
            case Z64CORE.Z64.CommandBuffer_CommandEventType.OBJECTSPAWN: {
                break;
            }
        }
    }

    onTick() {
        let count = this.ModLoader.emulator.rdramRead16(this.cmd_pointer + 0x2);
        if (count === 0) return;
        for (let i = 0; i < count; i++) {
            let offset = this.cmd_pointer + Z64CORE.Z64.COMMAND_EVENT_OFFSET + (i * Z64CORE.Z64.COMMAND_EVENT_SIZEOF);
            let event = this.ModLoader.emulator.rdramReadBuffer(offset, Z64CORE.Z64.COMMAND_EVENT_SIZEOF);
            let id = event.readUInt32BE(0);
            this.processEvent(id, event);
            this.ModLoader.utils.clearBuffer(event);
            this.ModLoader.emulator.rdramWriteBuffer(offset, event);
        }
        this.ModLoader.emulator.rdramWrite16(this.cmd_pointer + 0x2, 0);
    }

}