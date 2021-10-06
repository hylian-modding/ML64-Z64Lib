import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import Vector3 from "modloader64_api/Math/Vector3";
import { Heap } from "modloader64_api/heap";
import IMemory from "modloader64_api/IMemory";
import { SmartBuffer } from "smart-buffer";
import { DecodeImmediate, DecodeOpcode, EncodeImmediate, JAL_DECODE, JAL_ENCODE, J_ENCODE, OPCODEINDEXTYPE, OPCODE_DEFAULT } from "./OpcodeBullshit";
import { Deprecated } from "modloader64_api/Deprecated";
import { ActorBase } from "../Actor";
import { Z64LibSupportedGames } from "@Z64Lib/API/Utilities/Z64LibSupportedGames";
import { Command, IActor, ICommandBuffer } from "@Z64Lib/API/imports";
import { IInjectedAssembly } from "@Z64Lib/API/Common/IInjectedAssembly";
import { AssemblyList } from "@Z64Lib/API/Common/AssemblyList";
import { Z64_GAME } from "../types/GameAliases";

export enum CommandBuffer_CommandType {
    NONE,
    ACTORSPAWN,
    ACTORADDREMCAT,
    RELOCATE,
    UPDATEBUTTON,
    PLAYSOUND,
    PLAYMUSIC,
    WARP,
    MOVEPLAYERTOADDRESS,
    ARBITRARYFUNCTIONCALL,
    SFX,
    PVPDAMAGE,
    MALLOCFREE,
    OBJECTLOAD
}

export enum CommandBuffer_CommandEventType {
    NONE,
    INIT,
    SPAWN,
    SPAWNENTRY,
    SPAWNTRANSITION,
    DESTROY,
    UPDATE,
    OBJECTSPAWN,
    ERROR_FILLED
}

export const COMMAND_MAX = 64;
export const COMMANDEVENT_MAX = 200;
export const COMMAND_PARAM_SIZEOF = 0x20;
export const COMMAND_SIZEOF = COMMAND_PARAM_SIZEOF + 8;
export const COMMAND_OFFSET = 4;
export const COMMAND_RETURN_DATA_SIZEOF = 0x04;
export const COMMAND_RETURN_SIZEOF = COMMAND_RETURN_DATA_SIZEOF + 8;
export const COMMAND_RETURN_OFFSET = COMMAND_OFFSET + COMMAND_SIZEOF * COMMAND_MAX;
export const COMMAND_EVENT_SIZEOF = 8;
export const COMMAND_EVENT_OFFSET = COMMAND_RETURN_OFFSET + COMMAND_RETURN_SIZEOF * COMMAND_MAX;
export const COMMANDBUFFER_SIZEOF = 0x1334;

// TODO: blah blah pvp blah (doesn't belong here)
export interface IPvpContext {
    damageQueue: number
    damageType: number
    damageAngle: number
    damageFlags: number
    iframes: number
    enabled: number
}

export class CommandBuffer implements ICommandBuffer {
    ModLoader!: IModLoaderAPI;
    cmdbuf: number;
    uuid: number = 0;

    constructor(ModLoader: IModLoaderAPI, revision: number, game: Z64LibSupportedGames) {
        this.ModLoader = ModLoader;
        this.cmdbuf = CommandBuffer_Factory.Inject(this.ModLoader.emulator, this.ModLoader.heap!, revision, AssemblyList.getAssemblyForGame(game)!);
    }

    @Deprecated("CommandBuffer.runCommand is deprecated.")
    runCommand(command: Command, param: number, callback?: Function): void { }

    spawnActor(actorId: number, params: number, rot: Vector3, pos: Vector3, address: number = 0): Promise<IActor> {
        let count = this.ModLoader.emulator.rdramRead16(this.cmdbuf);
        let offset = this.cmdbuf + COMMAND_OFFSET + COMMAND_SIZEOF * count;

        let myUUID = this.uuid++;

        this.ModLoader.emulator.rdramWrite16(this.cmdbuf, count + 1);
        this.ModLoader.emulator.rdramWrite32(offset, CommandBuffer_CommandType.ACTORSPAWN);
        this.ModLoader.emulator.rdramWrite32(offset + 4, myUUID);
        this.ModLoader.emulator.rdramWrite16(offset + 8, actorId);
        this.ModLoader.emulator.rdramWrite16(offset + 8 + 2, params);
        this.ModLoader.emulator.rdramWrite16(offset + 8 + 4, Math.floor(rot.x) % 32768);
        this.ModLoader.emulator.rdramWrite16(offset + 8 + 6, Math.floor(rot.y) % 32768);
        this.ModLoader.emulator.rdramWrite16(offset + 8 + 8, Math.floor(rot.z) % 32768);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0xC, pos.x);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0x10, pos.y);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0x14, pos.z);
        this.ModLoader.emulator.rdramWrite32(offset + 8 + 0x18, address);

        return new Promise((accept, reject) => {
            this.ModLoader.utils.setTimeoutFrames(() => {
                for (let index = 0; index < COMMAND_MAX; index++) {
                    let offset = this.cmdbuf + COMMAND_RETURN_OFFSET + COMMAND_RETURN_SIZEOF * index;
                    let type = this.ModLoader.emulator.rdramRead32(offset);
                    let uuid = this.ModLoader.emulator.rdramRead32(offset + 4);

                    if (type === CommandBuffer_CommandType.ACTORSPAWN && uuid === myUUID) {
                        this.ModLoader.emulator.rdramWrite32(offset, 0); // free return slot
                        if (this.ModLoader.emulator.rdramRead32(offset + 8) === 0) {
                            reject("Actor pointer was zero.");
                        }
                        else {
                            accept(new ActorBase(this.ModLoader.emulator, this.ModLoader.emulator.rdramRead32(offset + 8)));
                        }
                    }
                }
                reject("Failed to find return value.");
            }, 1);
        });
    }

    spawnActorRXYZ(actorId: number, params: number, rotX: number, rotY: number, rotZ: number, pos: Vector3, address: number = 0): Promise<IActor> {
        let count = this.ModLoader.emulator.rdramRead16(this.cmdbuf);
        let offset = this.cmdbuf + COMMAND_OFFSET + COMMAND_SIZEOF * count;

        let myUUID = this.uuid++;

        this.ModLoader.emulator.rdramWrite16(this.cmdbuf, count + 1);
        this.ModLoader.emulator.rdramWrite32(offset, CommandBuffer_CommandType.ACTORSPAWN);
        this.ModLoader.emulator.rdramWrite32(offset + 4, myUUID);
        this.ModLoader.emulator.rdramWrite16(offset + 8, actorId);
        this.ModLoader.emulator.rdramWrite16(offset + 8 + 2, params);
        this.ModLoader.emulator.rdramWrite16(offset + 8 + 4, Math.floor(rotX) % 32768);
        this.ModLoader.emulator.rdramWrite16(offset + 8 + 6, Math.floor(rotY) % 32768);
        this.ModLoader.emulator.rdramWrite16(offset + 8 + 8, Math.floor(rotZ) % 32768);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0xc, pos.x);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0x10, pos.y);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0x14, pos.z);
        this.ModLoader.emulator.rdramWrite32(offset + 8 + 0x18, address);

        return new Promise((accept, reject) => {
            this.ModLoader.utils.setTimeoutFrames(() => {
                for (let index = 0; index < COMMAND_MAX; index++) {
                    let offset = this.cmdbuf + COMMAND_RETURN_OFFSET + COMMAND_RETURN_SIZEOF * index;
                    let type = this.ModLoader.emulator.rdramRead32(offset);
                    let uuid = this.ModLoader.emulator.rdramRead32(offset + 4);

                    if (type === CommandBuffer_CommandType.ACTORSPAWN && uuid === myUUID) {
                        this.ModLoader.emulator.rdramWrite32(offset, 0); // free return slot
                        if (this.ModLoader.emulator.rdramRead32(offset + 8) === 0) {
                            reject("Actor pointer was zero.");
                        }
                        else {
                            accept(new ActorBase(this.ModLoader.emulator, this.ModLoader.emulator.rdramRead32(offset + 8)));
                        }
                    }
                }
                reject("Failed to find return value.");
            }, 1);
        });
    }

    spawnActorRXY_Z(actorId: number, params: number, rotXY: number, rotZ: number, pos: Vector3, address: number = 0): Promise<IActor> {
        let count = this.ModLoader.emulator.rdramRead16(this.cmdbuf);
        let offset = this.cmdbuf + COMMAND_OFFSET + COMMAND_SIZEOF * count;

        let myUUID = this.uuid++;

        this.ModLoader.emulator.rdramWrite16(this.cmdbuf, count + 1);
        this.ModLoader.emulator.rdramWrite32(offset, CommandBuffer_CommandType.ACTORSPAWN);
        this.ModLoader.emulator.rdramWrite32(offset + 4, myUUID);
        this.ModLoader.emulator.rdramWrite16(offset + 8, actorId);
        this.ModLoader.emulator.rdramWrite16(offset + 8 + 2, params);
        this.ModLoader.emulator.rdramWrite32(offset + 8 + 4, Math.floor(rotXY));
        this.ModLoader.emulator.rdramWrite16(offset + 8 + 8, Math.floor(rotZ) % 32768);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0xc, pos.x);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0x10, pos.y);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0x14, pos.z);
        this.ModLoader.emulator.rdramWrite32(offset + 8 + 0x18, address);

        return new Promise((accept, reject) => {
            this.ModLoader.utils.setTimeoutFrames(() => {
                for (let index = 0; index < COMMAND_MAX; index++) {
                    let offset = this.cmdbuf + COMMAND_RETURN_OFFSET + COMMAND_RETURN_SIZEOF * index;
                    let type = this.ModLoader.emulator.rdramRead32(offset);
                    if (type === 0) continue;
                    let uuid = this.ModLoader.emulator.rdramRead32(offset + 4);

                    if (type === CommandBuffer_CommandType.ACTORSPAWN && uuid === myUUID) {
                        let addr = this.ModLoader.emulator.rdramRead32(offset + 8);
                        this.ModLoader.emulator.rdramWrite32(offset, 0); // free return slot
                        if (addr === 0) {
                            reject("Actor pointer was zero.");
                        }
                        else {
                            accept(new ActorBase(this.ModLoader.emulator, addr));
                        }
                    }
                }
                reject("Failed to find return value.");
            }, 1);
        });
    }

    relocateOverlay(allocatedVRamAddress: number, overlayInfoPointer: number, vRamAddress: number): Promise<void> {
        let count = this.ModLoader.emulator.rdramRead16(this.cmdbuf);
        let offset = this.cmdbuf + COMMAND_OFFSET + COMMAND_SIZEOF * count;

        this.ModLoader.emulator.rdramWrite16(this.cmdbuf, count + 1);
        this.ModLoader.emulator.rdramWrite32(offset, CommandBuffer_CommandType.RELOCATE);
        this.ModLoader.emulator.rdramWrite32(offset + 8, allocatedVRamAddress);
        this.ModLoader.emulator.rdramWrite32(offset + 8 + 4, overlayInfoPointer);
        this.ModLoader.emulator.rdramWrite32(offset + 8 + 8, vRamAddress);

        return new Promise((accept, reject) => {
            this.ModLoader.utils.setTimeoutFrames(() => {
                accept();
            }, 1);
        });
    }

    updateButton(button: number): void {
        let count = this.ModLoader.emulator.rdramRead16(this.cmdbuf);
        let offset = this.cmdbuf + COMMAND_OFFSET + COMMAND_SIZEOF * count;

        this.ModLoader.emulator.rdramWrite16(this.cmdbuf, count + 1);
        this.ModLoader.emulator.rdramWrite32(offset, CommandBuffer_CommandType.UPDATEBUTTON);
        this.ModLoader.emulator.rdramWrite16(offset + 8, button);
    }

    playSound(sfxId: number, a1: Vector3, a2: number, a3: number, a4: number, a5: number): void {
        let count = this.ModLoader.emulator.rdramRead16(this.cmdbuf);
        let offset = this.cmdbuf + COMMAND_OFFSET + COMMAND_SIZEOF * count;

        this.ModLoader.emulator.rdramWrite16(this.cmdbuf, count + 1);
        this.ModLoader.emulator.rdramWrite32(offset, CommandBuffer_CommandType.PLAYSOUND);
        this.ModLoader.emulator.rdramWrite16(offset + 8, sfxId);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0x4, a1.x);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0x8, a1.y);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0xc, a1.z);
        this.ModLoader.emulator.rdramWrite8(offset + 8 + 0x10, a2);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0x14, a3);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0x18, a4);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0x1c, a5);
    }

    runWarp(entranceIndex: number, cutsceneIndex: number, age?: number, transition?: number): Promise<boolean> {
        let count = this.ModLoader.emulator.rdramRead16(this.cmdbuf);
        let offset = this.cmdbuf + COMMAND_OFFSET + COMMAND_SIZEOF * count;

        this.ModLoader.emulator.rdramWrite16(this.cmdbuf, count + 1);
        this.ModLoader.emulator.rdramWrite32(offset, CommandBuffer_CommandType.WARP);
        this.ModLoader.emulator.rdramWrite32(offset + 8, entranceIndex);
        this.ModLoader.emulator.rdramWrite32(offset + 8 + 4, cutsceneIndex);

        if (age === undefined) {
            this.ModLoader.emulator.rdramWrite32(offset + 8 + 8, 0xFFFFFFFF);
        }
        else {
            this.ModLoader.emulator.rdramWrite32(offset + 8 + 8, age);
        }

        if (transition === undefined){
            this.ModLoader.emulator.rdramWrite32(offset + 8 + 0xC, 0xFFFFFFFF);
        }else{
            this.ModLoader.emulator.rdramWrite32(offset + 8 + 0xC, transition);
        }

        return new Promise((accept, reject) => {
            accept(true)
        });
    }

    movePlayerActorToAddress(address: number): Promise<boolean> {
        let count = this.ModLoader.emulator.rdramRead16(this.cmdbuf);
        let offset = this.cmdbuf + COMMAND_OFFSET + COMMAND_SIZEOF * count;

        let myUUID = this.uuid++;

        this.ModLoader.emulator.rdramWrite16(this.cmdbuf, count + 1);
        this.ModLoader.emulator.rdramWrite32(offset, CommandBuffer_CommandType.MOVEPLAYERTOADDRESS);
        this.ModLoader.emulator.rdramWrite32(offset + 4, myUUID);
        this.ModLoader.emulator.rdramWrite32(offset + 8, address);

        return new Promise((accept, reject) => {
            this.ModLoader.utils.setTimeoutFrames(() => {
                for (let index = 0; index < COMMAND_MAX; index++) {
                    let offset = this.cmdbuf + COMMAND_RETURN_OFFSET + COMMAND_RETURN_SIZEOF * index;
                    let type = this.ModLoader.emulator.rdramRead32(offset);
                    let uuid = this.ModLoader.emulator.rdramRead32(offset + 4);
                    if (type === 0) continue;
                    if (type === CommandBuffer_CommandType.MOVEPLAYERTOADDRESS && uuid === myUUID) {
                        let addr = this.ModLoader.emulator.rdramRead32(offset + 8);
                        this.ModLoader.emulator.rdramWrite32(offset, 0); // free return slot
                        if (addr === 0) {
                            reject("Player pointer was zero.");
                        }
                        else {
                            accept(true);
                        }
                    }
                }
                reject("Failed to find return value.");
            }, 1);
        });
    }

    // supports up to 8 args (exclusing args that go in FP regs); returns function return value (v0)
    arbitraryFunctionCall(functionAddress: number, argsPointer: number, argsCount: number): Promise<Buffer> {
        let count = this.ModLoader.emulator.rdramRead16(this.cmdbuf);
        let offset = this.cmdbuf + COMMAND_OFFSET + COMMAND_SIZEOF * count;

        let myUUID = this.uuid++;

        this.ModLoader.emulator.rdramWrite16(this.cmdbuf, count + 1);
        this.ModLoader.emulator.rdramWrite32(offset, CommandBuffer_CommandType.ARBITRARYFUNCTIONCALL);
        this.ModLoader.emulator.rdramWrite32(offset + 4, myUUID);
        this.ModLoader.emulator.rdramWrite32(offset + 8, functionAddress);
        this.ModLoader.emulator.rdramWrite32(offset + 8 + 4, argsPointer);
        this.ModLoader.emulator.rdramWrite32(offset + 8 + 8, argsCount);

        return new Promise((accept, reject) => {
            this.ModLoader.utils.setTimeoutFrames(() => {
                for (let index = 0; index < COMMAND_MAX; index++) {
                    let offset = this.cmdbuf + COMMAND_RETURN_OFFSET + COMMAND_RETURN_SIZEOF * index;
                    let type = this.ModLoader.emulator.rdramRead32(offset);
                    if (type === 0) continue;
                    let uuid = this.ModLoader.emulator.rdramRead32(offset + 4);

                    if (type === CommandBuffer_CommandType.ARBITRARYFUNCTIONCALL && uuid === myUUID) {
                        this.ModLoader.emulator.rdramWrite32(offset, 0); // free return slot
                        accept(this.ModLoader.emulator.rdramReadBuffer(offset + 8, 4));
                    }
                }
                reject("Failed to find return value!");
            }, 1);
        });
    }

    PvpDamage(context: IPvpContext, invokingActorPointer: number) {
        console.warn("Not functional when we are using gamestate cave! Bug Drahsid to transition to the new system (low priority)")
    }

    // param malloc == 0: free, param malloc == 1: malloc, param malloc == 2 mallocR, data = address on free, otherwise size of malloc
    Zelda_MallocFree(malloc: number, data: number): Promise<number> {
        let count = this.ModLoader.emulator.rdramRead16(this.cmdbuf);
        let offset = this.cmdbuf + COMMAND_OFFSET + COMMAND_SIZEOF * count;
        let myUUID = this.uuid++;

        this.ModLoader.emulator.rdramWrite16(this.cmdbuf, count + 1);
        this.ModLoader.emulator.rdramWrite32(offset, CommandBuffer_CommandType.MALLOCFREE);
        this.ModLoader.emulator.rdramWrite32(offset + 4, myUUID);
        this.ModLoader.emulator.rdramWrite32(offset + 8, malloc);
        this.ModLoader.emulator.rdramWrite32(offset + 8 + 4, data);

        return new Promise((accept, reject) => {
            if (malloc) {
                this.ModLoader.utils.setTimeoutFrames(() => {
                    for (let index = 0; index < COMMAND_MAX; index++) {
                        let offset = this.cmdbuf + COMMAND_RETURN_OFFSET + COMMAND_RETURN_SIZEOF * index;
                        let type = this.ModLoader.emulator.rdramRead32(offset);
                        let uuid = this.ModLoader.emulator.rdramRead32(offset + 4);
                        if (type === 0) continue;
                        if (type === CommandBuffer_CommandType.MALLOCFREE && uuid === myUUID) {
                            let addr = this.ModLoader.emulator.rdramRead32(offset + 8);
                            this.ModLoader.emulator.rdramWrite32(offset, 0); // free return slot
                            if (addr === 0) {
                                reject(-1);
                            }
                            else {
                                accept(addr);
                            }
                        }
                    }
                }, 1);
            }
            else {
                accept(1);
            }
        });
    }

    ObjectLoad(objectId: number): Promise<number> {
        let count = this.ModLoader.emulator.rdramRead16(this.cmdbuf);
        let offset = this.cmdbuf + COMMAND_OFFSET + COMMAND_SIZEOF * count;
        let myUUID = this.uuid++;

        this.ModLoader.emulator.rdramWrite16(this.cmdbuf, count + 1);
        this.ModLoader.emulator.rdramWrite32(offset, CommandBuffer_CommandType.OBJECTLOAD);
        this.ModLoader.emulator.rdramWrite32(offset + 4, myUUID);
        this.ModLoader.emulator.rdramWrite16(offset + 8, objectId);

        return new Promise((accept, reject) => {
            this.ModLoader.utils.setTimeoutFrames(() => {
                for (let index = 0; index < COMMAND_MAX; index++) {
                    let offset = this.cmdbuf + COMMAND_RETURN_OFFSET + COMMAND_RETURN_SIZEOF * index;
                    let type = this.ModLoader.emulator.rdramRead32(offset);
                    let uuid = this.ModLoader.emulator.rdramRead32(offset + 4);
                    if (type === 0) continue;
                    if (type === CommandBuffer_CommandType.OBJECTLOAD && uuid === myUUID) {
                        let addr = this.ModLoader.emulator.rdramRead32(offset + 8);
                        this.ModLoader.emulator.rdramWrite32(offset, 0); // free return slot
                        let obj_list: number = global.ModLoader["obj_context"];
                        obj_list += 0xC;
                        let _offset = addr * 0x44;
                        obj_list += _offset;
                        obj_list += 0x4;
                        accept(this.ModLoader.emulator.rdramRead32(obj_list));
                    }
                }
                reject(-1);
            }, 1);
        });
    }

    onTick() {
    }
}

export class CommandBuffer_Factory {
    static cmd_pointer: number = 0;
    static cmdbuf: number = 0;

    // Patches references to commandBuffer dummy address with the real deal
    private static ReplaceAddress(alloc: number, size: number, emu: IMemory, base: number, target: number) {
        //@BUG if we ever encounter non-sign extended values, we will need to read BASE_LO first to decide if we should fix sign extension, otherwise this will result in incorrect addresses!
        let BASE_HI = base >> 16
        let BASE_LO = base & 0x0000FFFF
        let TARGET_HI = target >> 16
        let TARGET_LO = target & 0x0000FFFF
        if (BASE_LO >= 0x7FFF) BASE_HI += 1
        if (TARGET_LO >= 0x7FFF) TARGET_HI += 1

        for (let i = 0; i < size; i += 4) {
            let inst = DecodeOpcode(emu.rdramReadBuffer(alloc + i, 4));
            if (inst.type === OPCODEINDEXTYPE.DEFAULT && inst.indx === OPCODE_DEFAULT.LUI) {
                let imm = DecodeImmediate(inst);
                if (imm === BASE_HI) {
                    let inst2 = DecodeOpcode(emu.rdramReadBuffer(alloc + i, 4));
                    let imm2 = DecodeImmediate(inst2);
                    let itr = i;

                    while (imm2 !== BASE_LO) {
                        itr += 4;
                        inst2 = DecodeOpcode(emu.rdramReadBuffer(alloc + itr, 4));
                        imm2 = DecodeImmediate(inst2);
                    }
                    let ninst1 = EncodeImmediate(inst, TARGET_HI);
                    let ninst2 = EncodeImmediate(inst2, TARGET_LO);
                    emu.rdramWriteBuffer(alloc + i, ninst1.data);
                    emu.rdramWriteBuffer(alloc + itr, ninst2.data);
                }
            }
        }
    }

    static Inject(emu: IMemory, heap: Heap, revision: number, inject: IInjectedAssembly): number {
        console.log("CommandBuffer Inject");
        emu.invalidateCachedCode();

        let alloc = (buf: Buffer) => {
            let m = heap.malloc(buf.byteLength);
            emu.rdramWriteBuffer(m, buf);
            return m;
        };

        let CommandBuffer_Update_malloc = alloc(inject.commandbuffer);
        let Actor_SpawnWithAddress_malloc = alloc(inject.Actor_SpawnWithAddress);
        let Actor_DestroyCave_malloc = alloc(inject.Actor_DestroyCave);
        //let Actor_InitCave_malloc = alloc(inject.Actor_InitCave);
        let Actor_SpawnEntryCave_malloc = alloc(inject.Actor_SpawnEntryCave);
        //let Actor_SpawnWithParentAndCutsceneCave_malloc = //@BUG This causes a redbar, I think I missed something up
        let Actor_SpawnCave_malloc = alloc(inject.Actor_SpawnCave);
        let Actor_SpawnTransitionActorCave_malloc = alloc(inject.Actor_SpawnTransitionActorCave);
        let Actor_UpdateCave_malloc = alloc(inject.Actor_UpdateCave);

        // if MM
        if (1 && inject.Actor_SpawnWithParentAndCutsceneCave !== undefined) {
            //Actor_SpawnWithParentAndCutsceneCave_malloc = alloc(inject.Actor_SpawnWithParentAndCutsceneCave);
        }

        // write JAL's to Actor_SpawnWithAddress
        for (let i = 0; i < inject.commandbuffer.byteLength; i += 4) {
            let inst = DecodeOpcode(inject.commandbuffer.slice(i, i + 4));
            if (inst.type === OPCODEINDEXTYPE.DEFAULT && inst.indx === OPCODE_DEFAULT.JAL) {
                let addr = JAL_DECODE(inst.data);
                if (addr === 0x03211234) {
                    emu.rdramWrite32(CommandBuffer_Update_malloc + i, JAL_ENCODE(Actor_SpawnWithAddress_malloc));
                }
            }
        }

        emu.rdramWrite32(inject.VERSIONS.get(revision)!.get("Actor_DestroyCave")!, JAL_ENCODE(Actor_DestroyCave_malloc));
        emu.rdramWrite32(inject.VERSIONS.get(revision)!.get("Actor_SpawnEntryCave")!, JAL_ENCODE(Actor_SpawnEntryCave_malloc));
        //emu.rdramWrite32(inject.VERSIONS.get(revision)!.get("Actor_InitCave")!, JAL_ENCODE(Actor_InitCave_malloc)); // @BUG This is never reached because we overwrite Actor_Spawn!
        emu.rdramWrite32(inject.VERSIONS.get(revision)!.get("Actor_UpdateCave")!, JAL_ENCODE(Actor_UpdateCave_malloc));
        emu.rdramWrite32(inject.VERSIONS.get(revision)!.get("CommandBuffer_Update")!, JAL_ENCODE(CommandBuffer_Update_malloc));

        let smartCave = new SmartBuffer()

        // if oot
        if (Z64_GAME === Z64LibSupportedGames.OCARINA_OF_TIME) {
            emu.rdramWrite32(inject.VERSIONS.get(revision)!.get("Actor_SpawnTransitionActorCave")!, JAL_ENCODE(Actor_SpawnTransitionActorCave_malloc));
            emu.rdramWrite32(inject.VERSIONS.get(revision)!.get("CommandBuffer_Update")!, JAL_ENCODE(CommandBuffer_Update_malloc));
        }
        else {
            smartCave.clear()
            smartCave.writeUInt32BE(J_ENCODE(Actor_SpawnTransitionActorCave_malloc));
            smartCave.writeBuffer(Buffer.from("0000000003E0000800000000", "hex"));
            emu.rdramWriteBuffer(inject.VERSIONS.get(revision)!.get("Actor_SpawnTransitionActorCave")!, smartCave.toBuffer());

            /*if (Actor_SpawnWithParentAndCutsceneCave_malloc) {
                smartCave.clear()
                smartCave.writeUInt32BE(J_ENCODE(Actor_SpawnWithParentAndCutsceneCave_malloc));
                smartCave.writeBuffer(Buffer.from("0000000003E0000800000000", "hex"));
                emu.rdramWriteBuffer(inject.VERSIONS.get(revision)!.get("Actor_SpawnWithParentAndCutsceneCave")!, smartCave.toBuffer());
            }*/

            //emu.rdramWrite32(inject.VERSIONS.get(revision)!.get("Actor_SpawnEntryCave2")!, JAL_ENCODE(Actor_SpawnEntryCave_malloc));
        }

        smartCave.clear();
        smartCave.writeUInt32BE(J_ENCODE(Actor_SpawnCave_malloc));
        smartCave.writeBuffer(Buffer.from("0000000003E0000800000000", "hex"));
        emu.rdramWriteBuffer(inject.VERSIONS.get(revision)!.get("Actor_SpawnCave")!, smartCave.toBuffer());

        this.cmd_pointer = heap.malloc(0x10);
        this.cmdbuf = heap.malloc(COMMANDBUFFER_SIZEOF);
        emu.rdramWrite32(this.cmd_pointer, this.cmdbuf);
        console.log(`Command buffer: ${this.cmdbuf.toString(16)}`);

        this.ReplaceAddress(CommandBuffer_Update_malloc, inject.commandbuffer.byteLength, emu, 0x12345678, this.cmd_pointer);
        this.ReplaceAddress(Actor_SpawnWithAddress_malloc, inject.Actor_SpawnWithAddress.byteLength, emu, 0x12345678, this.cmd_pointer);
        this.ReplaceAddress(Actor_DestroyCave_malloc, inject.Actor_DestroyCave.byteLength, emu, 0x12345678, this.cmd_pointer);
        //this.ReplaceAddress(Actor_InitCave_malloc, inject.Actor_InitCave.byteLength, emu, 0x12345678, this.cmd_pointer);
        this.ReplaceAddress(Actor_SpawnEntryCave_malloc, inject.Actor_SpawnEntryCave.byteLength, emu, 0x12345678, this.cmd_pointer);
        // if mm
        //if (1 && inject.Actor_SpawnWithParentAndCutsceneCave !== undefined && Actor_SpawnWithParentAndCutsceneCave_malloc) this.ReplaceAddress(Actor_SpawnWithParentAndCutsceneCave_malloc, inject.Actor_SpawnWithParentAndCutsceneCave.byteLength, emu, 0x12345678, this.cmd_pointer);
        this.ReplaceAddress(Actor_SpawnCave_malloc, inject.Actor_SpawnCave.byteLength, emu, 0x12345678, this.cmd_pointer);
        this.ReplaceAddress(Actor_SpawnTransitionActorCave_malloc, inject.Actor_SpawnTransitionActorCave.byteLength, emu, 0x12345678, this.cmd_pointer);
        this.ReplaceAddress(Actor_UpdateCave_malloc, inject.Actor_UpdateCave.byteLength, emu, 0x12345678, this.cmd_pointer);

        let alloc_pointers = (values: number[]) => {
            let p = heap.malloc(values.length * 4);
            let index = 0
            for (index = 0; index < values.length; index++) {
                emu.rdramWrite32(p + (index * 4), values[index])
            }
            return p;
        };

        /*         let SuperDynaPoly_AllocPolyList_malloc = alloc(SuperDynaPoly_AllocPolyList);
                let SuperDynaPoly_AllocVtxList_malloc = alloc(SuperDynaPoly_AllocVtxList);
                let SuperDynaSSNodeList_Alloc_malloc = alloc(SuperDynaSSNodeList_Alloc);

                let SuperPoly1Size = (512 * 10) * 0x10
                let SuperPoly2Size = (512 * 10) * 0x6
                let SuperPoly3Size = (1000 * 10) * 0xC

                let SuperPoly1 = heap.malloc(SuperPoly1Size);
                let SuperPoly2 = heap.malloc(SuperPoly2Size);
                let SuperPoly3 = heap.malloc(SuperPoly3Size);
                let SuperPoly3_size = SuperPoly3Size / 0xC;

                let pointers = alloc_pointers([SuperPoly1, SuperPoly2, SuperPoly3, SuperPoly3_size, 0])

                let SuperPoly1_pointer = pointers
                let SuperPoly2_pointer = pointers + 4
                let SuperPoly3_pointer = pointers + 8
                let SuperPoly3_size_pointer = pointers + 0x10
                emu.rdramWrite32(pointers + 0x10, pointers + 0xC)

                emu.rdramWrite32(this.VERSIONS.get(revision)!.get("SuperDynaPoly_AllocPolyList")!, JAL_ENCODE(SuperDynaPoly_AllocPolyList_malloc));
                emu.rdramWrite32(this.VERSIONS.get(revision)!.get("SuperDynaPoly_AllocVtxList")!, JAL_ENCODE(SuperDynaPoly_AllocVtxList_malloc));
                emu.rdramWrite32(this.VERSIONS.get(revision)!.get("SuperDynaSSNodeList_Alloc")!, JAL_ENCODE(SuperDynaSSNodeList_Alloc_malloc));

                this.ReplaceAddress(SuperDynaPoly_AllocPolyList_malloc, SuperDynaPoly_AllocPolyList.byteLength, emu, 0x12345678, SuperPoly1_pointer);
                this.ReplaceAddress(SuperDynaPoly_AllocVtxList_malloc, SuperDynaPoly_AllocVtxList.byteLength, emu, 0x12345678, SuperPoly2_pointer);
                this.ReplaceAddress(SuperDynaSSNodeList_Alloc_malloc, SuperDynaSSNodeList_Alloc.byteLength, emu, 0x12345678, SuperPoly3_pointer);

                this.ReplaceAddress(SuperDynaSSNodeList_Alloc_malloc, SuperDynaSSNodeList_Alloc.byteLength, emu, 0x43215678, SuperPoly3_size_pointer); */

        return this.cmdbuf;
    }
}
