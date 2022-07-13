import { IActorManager, IZ64Core } from "@Z64Lib/API/Common/Z64API";
import { NamedActorCategory, ActorCategory, IActor, Z64 } from "@Z64Lib/API/imports";
import * as Z64CORE from "@Z64Lib/src/importsZ64";
import { bus } from "modloader64_api/EventHandler";
import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import { COMMANDEVENT_MAX } from "./CommandBuffer";

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
        //console.log(`Got CMD ID: ${id}`)
        //if(id === 2 || id === 4) console.log(`[CommandBuffer] Command ID: ${id}`)
        switch (id) {
            case Z64CORE.Z64.CommandBuffer_CommandEventType.NONE:
                break;
            default: 
                console.log(`[CommandBuffer] Invalid command: ${id}`)
                break;
            case Z64CORE.Z64.CommandBuffer_CommandEventType.ERROR_FILLED:
                try {
                    // -1, -1 indicate catostrophic failure due to overflow
                    if (event.readUInt16BE(0x4) == 0xFFFF && event.readUInt16BE(0x6) == 0xFFFF) {
                        console.error("[CommandBuffer] Event system probably overflowed. Fuck. TODO: disconnect all promises that are awaiting a response, because they're not getting it")
                    }
                    else {
                        console.error(`[CommandBuffer] Tried to invoke an invalid command. uuid ${event.readUInt16BE(0x4)} type ${event.readUInt16BE(0x6)}`)
                    }
                } catch (err: any) {
                    console.log(err)
                }
                break;
            case Z64CORE.Z64.CommandBuffer_CommandEventType.INIT: {
                console.warn("[CommandBuffer] CommandEvent Init is deprecated because it is handled by the Actor_Spawn hooks.")
                break;
            }
            case Z64CORE.Z64.CommandBuffer_CommandEventType.SPAWNENTRY: {
                try {
                    let actorPointer = event.readUInt32BE(0x4);
                    let actor = this.createIActorFromPointer(actorPointer);
                    let hasDupe = false;
                    this.actors.forEach((actors: IActor[], key: ActorCategory) => {
                        for (let i = 0; i < actors.length; i++) {
                            if (actors[i].pointer === actorPointer) {
                                hasDupe = true;
                                break;
                            }
                        }
                    })
                    if (!hasDupe) {
                        this.actors.get(actor.actorType)!.push(actor);
                        this.allActors.set(actorPointer, actor);
                        bus.emit(Z64.Z64Events.ON_ACTOR_SPAWN, actor);
                        //console.log(`[CommandBuffer] Entry Actor Spawned: ${actor.actorID}`)
                    }
                } catch (err: any) {
                    console.log(err);
                }
                break;
            }
            case Z64CORE.Z64.CommandBuffer_CommandEventType.SPAWN:
            case Z64CORE.Z64.CommandBuffer_CommandEventType.SPAWNTRANSITION: {
                try {
                    let actorPointer = event.readUInt32BE(0x4);
                    let actor = this.createIActorFromPointer(actorPointer);
                    // normal spawns are handled by addcat
                    if (id === Z64CORE.Z64.CommandBuffer_CommandEventType.SPAWNTRANSITION) {
                        this.actors.get(actor.actorType)!.push(actor);
                        this.allActors.set(actorPointer, actor);
                    }
                    bus.emit(Z64.Z64Events.ON_ACTOR_SPAWN, actor);
                    //console.log(`[CommandBuffer] Actor Spawned: ${actor.actorID}`)
                } catch (err: any) {
                    console.log(err);
                }
                break;
            }
            case Z64CORE.Z64.CommandBuffer_CommandEventType.ADDCAT: {
                try {
                    let actorPointer = event.readUInt32BE(0x4);
                    let actor = this.createIActorFromPointer(actorPointer);
                    let category = event.readUInt16BE(0x8);
                    //console.log(`[CommandBuffer] Actor ${actor.actorID.toString(16)} added to category ${NamedActorCategory[category]}`);
                    this.actors.get(actor.actorType)!.push(actor);
                    this.allActors.set(actorPointer, actor);
                    bus.emit(Z64.Z64Events.ON_ACTOR_ADDED_TO_CATEGORY, actor, category);
                } catch(err) {
                    console.log(err)
                }
                break;
            }
            case Z64CORE.Z64.CommandBuffer_CommandEventType.REMCAT: {
                try {
                    let actorPointer = event.readUInt32BE(0x4);
                    let category = event.readUInt16BE(0x8);
                    this.actors.forEach((actors: IActor[], key: ActorCategory) => {
                        for (let i = 0; i < actors.length; i++) {
                            if (actors[i].pointer === actorPointer) {
                                actors[i].exists = false;
                                bus.emit(Z64.Z64Events.ON_ACTOR_REMOVED_FROM_CATEGORY, actors[i], category);
                                //console.log(`[CommandBuffer] Actor ${actors[i].actorID.toString(16)} removed from category ${NamedActorCategory[category]}`);
                                actors.splice(i, 1);
                                break;
                            }
                        }
                    });
                    this.allActors.delete(actorPointer);
                } catch(err) {
                    console.log(err)
                }
                break;
            }
            case Z64CORE.Z64.CommandBuffer_CommandEventType.DESTROY: {
                let actorPointer = event.readUInt32BE(0x4);
                this.actors.forEach((actors: IActor[], key: ActorCategory) => {

                    for (let i = 0; i < actors.length; i++) {
                        if (actors[i].pointer === actorPointer) {
                            actors[i].exists = false;
                            bus.emit(Z64.Z64Events.ON_ACTOR_DESPAWN, actors[i]);
                            //console.log(`[CommandBuffer] Actor Destroyed: ${actors[i].actorID}`)
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
                bus.emit(Z64.Z64Events.ON_ACTOR_UPDATE, actor);
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

        if (count >= COMMANDEVENT_MAX) {
            count = COMMANDEVENT_MAX;
            //console.error("[CommandBuffer] CommandEvents overflowed. Are you good?!")
        }

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